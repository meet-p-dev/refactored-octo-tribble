// Shared Enable Banking helpers for MoneyTrack edge functions.
const BASE = "https://api.enablebanking.com";

function bytesToB64u(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
const strToB64u = (s: string) => bytesToB64u(new TextEncoder().encode(s));

function pemToPkcs8(): ArrayBuffer {
  const b64 = Deno.env.get("EB_PRIVATE_KEY_B64");
  if (!b64) throw new Error("EB_PRIVATE_KEY_B64 secret is not set");
  const pem = atob(b64);
  const body = pem.replace(/-----BEGIN [^-]+-----/, "").replace(/-----END [^-]+-----/, "").replace(/\s+/g, "");
  const der = atob(body);
  const buf = new Uint8Array(der.length);
  for (let i = 0; i < der.length; i++) buf[i] = der.charCodeAt(i);
  return buf.buffer;
}

async function jwt(): Promise<string> {
  const appId = Deno.env.get("EB_APPLICATION_ID");
  if (!appId) throw new Error("EB_APPLICATION_ID secret is not set");
  const now = Math.floor(Date.now() / 1000);
  const head = strToB64u(JSON.stringify({ typ: "JWT", alg: "RS256", kid: appId }));
  const body = strToB64u(JSON.stringify({ iss: "enablebanking.com", aud: "api.enablebanking.com", iat: now, exp: now + 3600 }));
  const data = `${head}.${body}`;
  const key = await crypto.subtle.importKey("pkcs8", pemToPkcs8(), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(data));
  return `${data}.${bytesToB64u(new Uint8Array(sig))}`;
}

export async function ebApi(method: string, path: string, body?: unknown): Promise<any> {
  const r = await fetch(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${await jwt()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

// Bug 1 fix — pending vs booked. When Sparkasse (and other DE banks) first show a card
// purchase it is PENDING, and 1–2 days later it BOOKS. Enable Banking returns each with a
// DIFFERENT entry_reference, so the external_id dedup can't tell they are the same purchase
// → the app showed it twice, and deleting one let the cron re-add it. We now ingest ONLY
// booked entries, so every debit lands exactly once (it appears once it books).
// Missing/empty status is treated as booked so we never drop a real transaction from a bank
// that omits the field.
export function isBooked(t: any): boolean {
  const s = String(t?.status || "").toUpperCase();
  return s === "" || s === "BOOK" || s === "BOOKED";
}

const CAT_RULES: [string, RegExp][] = [
  ["groceries", /\b(rewe|edeka|aldi|lidl|penny|netto|kaufland|real|hit markt|denns|alnatura|tegut|globus|dm(?:\b|-drogerie)|rossmann|müller|lebensmittel)\b/i],
  ["dining", /\b(mcdonald|burger king|kfc|subway|starbucks|restaurant|café|cafe|bäcker|baecker|bakery|pizza|döner|doener|imbiss|lieferando|uber ?eats|wolt|gorillas|flink|kantine|gastro)\b/i],
  ["transport", /\b(db vertrieb|deutsche bahn|bahn|bvg|vgn|mvg|hvv|rmv|flixbus|tankstelle|aral|shell|esso|jet|total|agip|uber(?! ?eats)|bolt|free ?now|tier|lime|voi|parken|parkhaus|dbahn)\b/i],
  ["subscr", /\b(netflix|spotify|disney\+?|dazn|sky|youtube ?premium|amazon prime|apple\.com\/bill|itunes|icloud|google \*|adobe|microsoft|dropbox|notion|audible|patreon|linkedin|nytimes|freenet|drillisch)\b/i],
  ["shopping", /\b(amazon(?!.*prime)|zalando|about ?you|otto|media ?markt|saturn|ikea|h&m|zara|c&a|primark|decathlon|douglas|apple store|mediamarkt|thalia|conrad|action)\b/i],
  ["health", /\b(apotheke|pharmacy|arzt|zahnarzt|klinik|praxis|dr\.?\s|krankenhaus|physio|fitness|mcfit|fitx|clever ?fit|gym|urban sports|tk\b|aok|barmer|dak|krankenkasse|techniker krankenkasse)\b/i],
  ["entertain", /\b(kino|cinema|cinemaxx|uci|steam|playstation|xbox|nintendo|twitch|spielhalle|konzert|ticketmaster|eventim|freizeit|museum|zoo)\b/i],
  ["rent", /\b(miete|kaltmiete|warmmiete|rent|hausverwaltung|strom|stadtwerke|vattenfall|e\.?on|eon|enbw|rwe|gasag|vodafone|telekom|o2\b|1&1|1und1|congstar|gez|rundfunk|beitragsservice|versicherung|allianz|huk|internet)\b/i],
  ["transfer", /\b(umbuchung|übertrag|uebertrag|eigenübertrag|internal transfer|savings|sparen|tagesgeld)\b/i],
  ["debt", /\b(kredit|darlehen|ratenzahlung|tilgung|loan|repayment)\b/i],
];
const INCOME_RULES: [string, RegExp][] = [
  ["salary", /\b(gehalt|lohn|salary|payroll|bezüge|besoldung|entgelt|arbeitgeber|zenjob)\b/i],
  ["freelance", /\b(honorar|freelance|rechnung|invoice|auftrag|freiberuf)\b/i],
];
function categorize(party: string, rem: string, isDebit: boolean): string {
  const text = `${party || ""} ${rem || ""}`;
  const rules = isDebit ? CAT_RULES : [...INCOME_RULES, ...CAT_RULES];
  for (const [id, re] of rules) if (re.test(text)) return id;
  return "other";
}

export function mapEbTx(t: any, accountId: string, userId: string) {
  const dbit = t.credit_debit_indicator === "DBIT";
  const amt = Math.abs(Number(t.transaction_amount?.amount || 0));
  const party = dbit ? t.creditor?.name : t.debtor?.name;
  const rem = ([] as string[]).concat(t.remittance_information || []).join(" ").trim();
  const raw = t.booking_date || t.value_date || "";
  const date = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    user_id: userId,
    account_id: accountId,
    external_id: "eb-" + (t.entry_reference || t.transaction_id || `${accountId}-${date}-${amt}`),
    type: dbit ? "expense" : "income",
    amount: amt,
    merchant: (party || rem || "Bank transaction").slice(0, 60),
    category: categorize(party || "", rem, dbit),
    notes: rem,
    date,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared merchant prior — day-one categorisation for everyone.
//
// A brand-new user has zero learning history, so without this every expense from an
// unrecognised shop lands in "Other" until they fix it by hand. This is a curated map of
// well-known (mostly DE/EU) merchants → category that ships with the app, so REWE reads as
// Groceries and Netflix as Subscriptions from the very first sync — for any user, offline,
// with no account needed.
//
// PRIVACY — the hard rule: only ORGANISATIONS ever appear here. Never a personal name.
// Real ledgers are full of people (flatmates, friends) and what those payments mean is
// private and per-user; that stays local in mt-payee-stats and is never shared.
//
// Precedence at classify time (most specific wins):
//   your per-tx decision  >  what you taught for this payee  >  this shared prior  >  bank's guess
// So a wrong match here is always one correction away from being fixed forever, and the
// blast radius is tiny: it only fills in a category that would otherwise be "Other", and
// it never changes a transaction's type (income vs spend) or any amount.
//
// Token choice matters: brand tokens that are also common surnames (Müller, Real, Jet) are
// deliberately excluded or require retail context, so a payment to a friend named e.g.
// "Norma Müller" is never mistaken for a supermarket.
// ─────────────────────────────────────────────────────────────────────────────

// Retail context: a receipt marker ("LIDL SAGT DANKE"), a legal-entity suffix, or the name
// standing alone. Used to safely trust brand tokens that double as personal names.
const RETAIL_CTX = /(sagt danke|danke|markt|filiale|gmbh|\bag\b|\bse\b|\bkg\b|discount|supermarkt|drogerie|tankstelle|store|shop)/i;
// Brand tokens that are ALSO common given names/surnames. Only trusted WITH retail context,
// so a payment to a friend named "Norma Mueller" or "Douglas Smith" is never miscategorised.
const AMBIGUOUS = true;

export const MERCHANT_PRIOR = [
  // ── groceries & drugstores ──
  [/\b(rewe|edeka|aldi|lidl|netto|kaufland|globus|tegut|denns|alnatura|marktkauf|famila|nahkauf|trinkgut|combi|hit markt|wasgau|feneberg|nahversorger)\b/i, "groceries"],
  [/\b(norma|penny|douglas)\b/i, "groceries", AMBIGUOUS],
  [/\b(rossmann|dm[- ]?drogerie|drogerie ?m[uü]ller|budni)\b/i, "groceries"],
  [/\b(bio ?company|basic bio|frischemarkt|getr[aä]nkemarkt|metro\b)\b/i, "groceries"],

  // ── dining, bakeries, delivery ──
  [/\b(mcdonald|burger king|kfc|subway|starbucks|dunkin|vapiano|nordsee|yormas|backwerk|kamps|b[aä]cker|baecker|dean ?& ?david|hans im gl[uü]ck|l'?osteria|five guys|pizza|d[oö]ner|doener|imbiss|restaurant|bistro|caf[eé]\b|kantine|mensa|trattoria|sushi|asia|steakhouse)\b/i, "dining"],
  [/\b(lieferando|uber ?eats|wolt|flink|gorillas|deliveroo|too good to go|foodora|knuspr)\b/i, "dining"],

  // ── subscriptions, media, phone & internet ──
  [/\b(netflix|spotify|disney|dazn|sky ?(deutschland|de)?\b|youtube ?premium|amazon prime|prime video|apple\.com\/bill|itunes|icloud|google ?(one|play|storage)|adobe|microsoft|office ?365|dropbox|notion|audible|patreon|nytimes|spiegel|zeit online|blinkist|duolingo|chatgpt|openai|anthropic)\b/i, "subscr"],
  [/\b(telekom|vodafone|o2\b|congstar|drillisch|sim24|simyo|winsim|freenet|1&1|1und1|aldi talk|lebara|lycamobile|blau\.de|pyur|unitymedia|1u1)\b/i, "subscr"],

  // ── transport, fuel, parking ──
  [/\b(deutsche bahn|db vertrieb|db fernverkehr|bahn\.de|bvg|mvg|hvv|rmv|vgn|vrr|vrs|vbb|flixbus|flixtrain|blablacar|uber(?! ?eats)|free ?now|lime\b|voi\b|nextbike|call a bike|swapfiets|sixt|europcar|hertz|miles mobility|share ?now)\b/i, "transport"],
  [/\b(bolt|tier|bird)\b/i, "transport", AMBIGUOUS],
  [/\b(aral|shell|esso|total ?energies|agip|omv|star tankstelle|tankstelle|hem tankstelle|raiffeisen tank)\b/i, "transport"],
  [/\b(apcoa|contipark|q-?park|easypark|parkster|parkhaus|parkraum)\b/i, "transport"],

  // ── shopping & home ──
  [/\b(amazon(?!.*prime)|zalando|about ?you|otto ?gmbh|media ?markt|mediamarkt|saturn|ikea|h ?& ?m|zara|c ?& ?a|primark|decathlon|thalia|conrad|action\b|tk ?maxx|depot\b|xxxlutz|h[oö]ffner|obi\b|bauhaus|hornbach|toom|globetrotter|snipes|foot ?locker|zooplus|fressnapf|temu|shein|aliexpress)\b/i, "shopping"],

  // ── health & fitness ──
  [/\b(apotheke|pharmacy|doctolib|zahnarzt|hausarzt|arztpraxis|klinik|krankenhaus|physio|labor\b)\b/i, "health"],
  [/\b(mcfit|fitx|clever ?fit|urban sports|fitness ?first|john reed|gold'?s gym|holmes place|superfit)\b/i, "health"],
  [/\b(techniker krankenkasse|\btk[- ]?buchnr|\baok\b|barmer|dak\b|\bikk\b|\bhkk\b|\bkkh\b|krankenkasse|\bbkk\b|debeka|pflegeversicherung)\b/i, "health"],

  // ── entertainment ──
  [/\b(kino|cinema|cinemaxx|uci ?kinowelt|cinestar|steam ?games|steampowered|playstation|xbox|nintendo|epic ?games|twitch|ticketmaster|eventim|museum|zoo\b|therme|freizeitbad|escape ?room|bowling)\b/i, "entertain"],

  // ── rent, utilities & bills ──
  [/\b(stadtwerke|vattenfall|e\.?on\b|enbw|rwe\b|gasag|lichtblick|naturstrom|yello ?strom|eprimo|octopus energy|energieversorgung|wasserwerk)\b/i, "rent"],
  [/\b(gez\b|rundfunk|beitragsservice|hausverwaltung|kaltmiete|warmmiete|nebenkosten|betriebskosten|vonovia|deutsche wohnen|lebensraum|wohnungsbau|mietkaution)\b/i, "rent"],
  [/\b(allianz|huk|\baxa\b|ergo ?versicherung|generali|signal iduna|cosmosdirekt|haftpflicht|hausrat|versicherung)\b/i, "rent"],
];

// Normalised lookup: returns a category id, or null when nothing is confident.
// NOTE: deliberately NOT gated on looksLikePerson() — real retail names like
// "EDEKA RIASANOW" or "NORMA SAGT DANKE" look like personal names to that heuristic.
// Safety comes from the brand tokens being specific, plus the AMBIGUOUS tier below.
export function merchantCategory(name) {
  const n = (name || "").trim();
  if (!n) return null;
  // A lone word ("KAUFLAND") or a retail marker ("NORMA SAGT DANKE") means it's a shop,
  // not a person — that's what lets us trust name-like brand tokens.
  const looksRetail = n.split(/\s+/).filter(Boolean).length === 1 || RETAIL_CTX.test(n);
  for (const [re, cat, ambiguous] of MERCHANT_PRIOR) {
    if (!re.test(n)) continue;
    if (ambiguous && !looksRetail) continue; // e.g. "Norma Mueller" → not a supermarket
    return cat;
  }
  return null;
}

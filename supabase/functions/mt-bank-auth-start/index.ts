import { ebApi } from "./eb.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers") || "authorization, x-client-info, apikey, content-type",
  };
}

// Where the bank sends the user back once they approve the consent. This used to
// default to Heimat's site — a different product that only shares this Supabase
// project — so a MoneyTrack user connecting their bank was handed a Heimat URL.
// It is MoneyTrack's own page now.
//
// EB_REDIRECT_URL still wins if set, which is also the way back: point it at the
// old URL and the previous behaviour returns with no redeploy. Whatever it
// resolves to has to be registered as a redirect for the Enable Banking
// application, or /auth refuses the request outright.
const DEFAULT_REDIRECT = "https://meet-p-dev.github.io/refactored-octo-tribble/cb.html";

Deno.serve(async (req) => {
  const CORS = cors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
  try {
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const { bank_name, country = "DE", iban } = await req.json();
    if (!bank_name) return json({ error: "bank_name required" }, 400);

    const validUntil = new Date(Date.now() + 89 * 864e5).toISOString().replace(/\.\d+Z$/, "Z");
    const redirect = Deno.env.get("EB_REDIRECT_URL") || DEFAULT_REDIRECT;

    // Some banks (notably Revolut) return zero accounts when asked for "all accounts".
    // If the user supplies an IBAN, request that specific account in the consent.
    const cleanIban = typeof iban === "string" ? iban.replace(/\s+/g, "").toUpperCase() : "";
    const access: Record<string, unknown> = { valid_until: validUntil, transactions: true, balances: true };
    if (cleanIban) access.accounts = [{ iban: cleanIban }];
    // log the redirect too: if Enable Banking rejects the consent, the URL it was
    // asked to use is the first thing worth seeing
    console.log("[auth-start] bank=", bank_name, "iban=", cleanIban ? cleanIban.slice(0, 8) + "…" : "(none)", "redirect=", redirect);

    const auth = await ebApi("POST", "/auth", {
      access,
      aspsp: { name: bank_name, country },
      redirect_url: redirect, state: "moneytrack", psu_type: "personal",
    });
    return json({ url: auth.url });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 400);
  }
});

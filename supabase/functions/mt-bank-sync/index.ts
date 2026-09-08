import { ebApi, mapEbTx, isBooked } from "./eb.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SVC_ENV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Authorize the caller. Supabase may inject SUPABASE_SERVICE_ROLE_KEY in a different key format
// than the legacy JWT stored in Vault, so a plain string compare isn't enough. Instead, VERIFY the
// presented token really has service-role power by calling an admin-only endpoint with it.
async function isAuthorized(req: Request): Promise<boolean> {
  const bearer = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const cronSecret = Deno.env.get("CRON_SECRET") || "";
  const cronHdr = req.headers.get("x-cron-secret") || "";
  if (cronSecret && cronHdr === cronSecret) return true;
  if (!bearer) return false;
  if (SVC_ENV && bearer === SVC_ENV) return true;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1`, {
      headers: { Authorization: `Bearer ${bearer}`, apikey: bearer },
    });
    return r.status === 200; // only a real service-role credential can list users
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (!(await isAuthorized(req))) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  const supa = createClient(SUPABASE_URL, SVC_ENV);
  const results: any[] = [];
  const { data: conns } = await supa.from("mt_bank_connections").select("*").eq("status", "active");
  const today = new Date().toISOString().slice(0, 10);
  console.log("[sync] connections:", (conns || []).length);

  for (const conn of (conns || [])) {
    try {
      let added = 0, skippedPending = 0;
      const dateFrom = conn.sync_from || today;   // never import history
      const { data: accts } = await supa.from("mt_accounts").select("id,bank_account_uid").eq("bank_connection_id", conn.id);
      for (const acct of (accts || [])) {
        const aid = acct.bank_account_uid;
        if (!aid) continue;
        let key: string | null = null, page = 0; const rows: any[] = [];
        do {
          const q = new URLSearchParams({ date_from: dateFrom });
          if (key) q.set("continuation_key", key);
          const tr = await ebApi("GET", `/accounts/${aid}/transactions?${q}`);
          for (const t of (tr.transactions || [])) {
            // Bug 1: ingest only booked entries. A pending charge is skipped now and picked up
            // once it books, so the same purchase never lands as two rows.
            if (!isBooked(t)) { skippedPending++; continue; }
            rows.push(mapEbTx(t, acct.id, conn.user_id));
          }
          key = tr.continuation_key; page++;
        } while (key && page < 20);
        const eligible = rows.filter((r) => r.date >= dateFrom);
        if (eligible.length) {
          const ext = eligible.map((r) => r.external_id);
          const { data: existing } = await supa.from("mt_transactions").select("external_id").eq("user_id", conn.user_id).in("external_id", ext);
          const have = new Set((existing || []).map((r: any) => r.external_id));
          const fresh = eligible.filter((r) => !have.has(r.external_id));
          if (fresh.length) { const { error } = await supa.from("mt_transactions").insert(fresh); if (error) throw error; added += fresh.length; }
        }
      }
      await supa.from("mt_bank_connections").update({ last_synced_at: new Date().toISOString(), last_sync_error: null }).eq("id", conn.id);
      console.log("[sync] ok", conn.bank_name, "from", dateFrom, "added", added, "skippedPending", skippedPending);
      results.push({ bank: conn.bank_name, since: dateFrom, added, skippedPending });
    } catch (e) {
      const msg = String((e as Error)?.message || e);
      await supa.from("mt_bank_connections").update({ last_sync_error: msg }).eq("id", conn.id);
      console.log("[sync] ERROR", conn.bank_name, msg);
      results.push({ bank: conn.bank_name, error: msg });
    }
  }
  return new Response(JSON.stringify({ ok: true, results }), { headers: { "Content-Type": "application/json" } });
});

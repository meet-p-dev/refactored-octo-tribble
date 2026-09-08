"use client";
// Bank-sync layer: maps Supabase rows -> MoneyTrack shapes, wraps auth + edge functions.
// Bank accounts/transactions live in Supabase; the app merges them into local state additively.
import { sb } from "./supabase";
import { touchAppUser } from "./appUser";

// Supabase row -> app shapes. Prefixed ids ("sb-") never collide with local account ids.
export const mapAcc = (r) => ({
  id: "sb-" + r.id, name: r.name, color: r.color || "#3b82f6",
  ib: Number(r.initial_balance) || 0, _bank: true,
});
export const mapTx = (r) => ({
  id: "sb-" + r.id, type: r.type, amount: Number(r.amount) || 0,
  merchant: r.merchant || "", category: r.category || "other",
  accountId: "sb-" + r.account_id, toAccountId: r.to_account_id ? "sb-" + r.to_account_id : "",
  notes: r.notes || "", date: (r.date || "").slice(0, 10),
  isSplit: false, splitPeople: 1, splitSettled: false, _bank: true,
});

async function invokeMsg(fn, body) {
  const c = sb();
  // getSession() refreshes the token if it's expired, so the auto-attached auth header is fresh.
  // Do NOT override headers here — that drops the apikey the Functions gateway requires (→ 401).
  const { data: { session } } = await c.auth.getSession();
  if (!session) throw new Error("Please sign in again — you're not logged in on this browser.");
  const { data, error } = await c.functions.invoke(fn, { body });
  if (error) {
    let msg = error.message;
    try { const j = await error.context.json(); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

// ── Cloud-synced learning (mt_user_prefs) ──
// The classifier's learning — per-payee label stats, per-tx decisions, manual share
// overrides, owner name — is stored per-user in Supabase so it syncs across devices and
// survives a reinstall. RLS restricts each row to its owner; the app writes directly with
// the user session (no edge function). Fails soft: if the table/permission is missing,
// these return null / no-op and the app keeps working from localStorage.
export async function fetchPrefs() {
  const c = sb(); if (!c) return null;
  const { data: { session } } = await c.auth.getSession();
  if (!session) return null;
  const { data, error } = await c.from("mt_user_prefs").select("*").eq("user_id", session.user.id).maybeSingle();
  if (error) { console.warn("fetchPrefs:", error.message); return null; }
  return data; // null if no row yet
}
export async function savePrefs({ payeeStats, txDecisions, shareOverrides, ownerName }) {
  const c = sb(); if (!c) return;
  const { data: { session } } = await c.auth.getSession();
  if (!session) return;
  const row = {
    user_id: session.user.id,
    payee_stats: payeeStats || {}, tx_decisions: txDecisions || {},
    share_overrides: shareOverrides || {}, owner_name: ownerName || "",
    updated_at: new Date().toISOString(),
  };
  const { error } = await c.from("mt_user_prefs").upsert(row, { onConflict: "user_id" });
  if (error) console.warn("savePrefs:", error.message);
}

export async function currentUser() {
  const c = sb(); if (!c) return null;
  const { data } = await c.auth.getSession();
  return data?.session?.user || null;
}
// Typed auth error: carries a `kind` so the UI can react (e.g. offer a reset on wrongpw).
// kinds: wrongpw | unconfirmed | rate | network | weakpw | other
function authError(kind, message) { const e = new Error(message); e.kind = kind; return e; }
const lc = e => (e?.message || "").toLowerCase();

// Email + password. One call handles sign-in AND first-time sign-up, but with HONEST
// errors: a wrong password on an existing account is reported as exactly that (not as a
// failed signup), so the UI can offer a password reset instead of lying "wrong password"
// for every failure mode.
export async function signInPassword(email, password) {
  const c = sb(); email = (email || "").trim();
  if (!c) throw authError("network", "Can't reach the server — check your connection.");
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (!error) { touchAppUser(); return data.user; }
  const msg = lc(error), status = error.status;
  if (status === 429 || /rate.?limit|too many|for security purposes/.test(msg))
    throw authError("rate", "Too many attempts. Wait about a minute, then try again.");
  if (/email not confirmed|not confirmed|confirm your email/.test(msg))
    throw authError("unconfirmed", "This email isn't confirmed yet — check your inbox for the confirmation link.");
  if (/failed to fetch|networkerror|load failed/.test(msg))
    throw authError("network", "Can't reach the server — check your connection.");
  if (/invalid login credentials|invalid credentials/.test(msg) || status === 400) {
    // Ambiguous: wrong password on an existing account, OR a brand-new signup. A signup
    // attempt disambiguates — "already registered" means the account exists ⇒ wrong password.
    const { data: d2, error: e2 } = await c.auth.signUp({ email, password });
    if (!e2) {
      if (d2.session) { touchAppUser(); return d2.user; }   // new account, logged straight in
      throw authError("unconfirmed", "Account created — check your email to confirm it, then sign in.");
    }
    const m2 = lc(e2);
    if (/already registered|already exists|already.*registered/.test(m2))
      throw authError("wrongpw", "Incorrect password for this account.");
    if (e2.status === 429 || /rate.?limit|too many/.test(m2))
      throw authError("rate", "Too many attempts. Wait about a minute, then try again.");
    if (/password/.test(m2)) throw authError("weakpw", e2.message || "Password too weak — use at least 6 characters.");
    throw authError("other", e2.message || "Couldn't sign in.");
  }
  throw authError("other", error.message || "Couldn't sign in.");
}
export async function signOut() { await sb().auth.signOut(); }
export async function changePassword(newPassword) {
  const { error } = await sb().auth.updateUser({ password: newPassword });
  if (error) throw authError("other", error.message || "Couldn't change the password.");
}
// Where the emailed reset link comes back to: MoneyTrack's own /reset page, not
// whatever page the user happened to be on. The link is opened by whichever
// browser the mail app picks, often on a device that has never run MoneyTrack,
// and it has to land somewhere unmistakably MoneyTrack's — Heimat shares this
// Supabase project and, on GitHub Pages, this origin too. NEXT_PUBLIC_MT_RESET_URL
// overrides it whole, for the day MoneyTrack moves to a domain of its own.
export function resetUrl() {
  if (process.env.NEXT_PUBLIC_MT_RESET_URL) return process.env.NEXT_PUBLIC_MT_RESET_URL;
  if (typeof window === "undefined") return undefined;
  return window.location.origin + "/refactored-octo-tribble/reset/";
}

// Send a password-recovery email. The link lands on the reset page above, which
// turns the recovery token into a session and asks for the new password. The
// in-app PASSWORD_RECOVERY handler (see onAuthChange) stays as a fallback for
// links sent before that page existed. Requires email enabled in Supabase and
// BOTH apps' reset URLs allow-listed under Auth → URL Configuration.
export async function sendPasswordReset(email) {
  const c = sb(); email = (email || "").trim();
  if (!c) throw authError("network", "Can't reach the server — check your connection.");
  if (!email) throw authError("other", "Enter your email first, then tap reset.");
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: resetUrl() });
  if (error) {
    if (error.status === 429) throw authError("rate", "Too many requests — wait a minute and try again.");
    throw authError("other", error.message || "Couldn't send the reset email.");
  }
}
// Set a new password (used both when logged in AND during recovery — recovery grants a
// temporary session that authorises this update).
export async function completePasswordReset(newPassword) {
  const { data, error } = await sb().auth.updateUser({ password: newPassword });
  if (error) throw authError("other", error.message || "Couldn't set the new password.");
  await touchAppUser();
  return data.user;
}
export function onAuthChange(cb) {
  const c = sb(); if (!c) return () => {};
  const { data } = c.auth.onAuthStateChange((event, session) => cb(session?.user || null, event));
  return () => data.subscription.unsubscribe();
}

export async function fetchBankData() {
  const c = sb();
  const [{ data: accs }, { data: txs }, { data: conns }] = await Promise.all([
    c.from("mt_accounts").select("*"),
    c.from("mt_transactions").select("*").order("date", { ascending: false }),
    c.from("mt_bank_connections").select("*").order("created_at", { ascending: false }),
  ]);
  return { accs: (accs || []).map(mapAcc), txs: (txs || []).map(mapTx), conns: conns || [] };
}

// Returns the bank-login URL. `iban` is optional — some banks (Revolut) share no accounts
// unless the consent names the exact account.
export async function startConnect(bank_name, iban = "", country = "DE") {
  const d = await invokeMsg("mt-bank-auth-start", { bank_name, country, iban });
  return d.url;
}
// After the user logs in at their bank and gets a code, exchange it: creates accounts + pulls txns.
export async function finishConnect(code, bank_name) {
  return await invokeMsg("mt-bank-connect", { code, bank_name });
}

// Permanently remove a bank account: delete its cloud row (cascades its transactions) and,
// if its connection has no accounts left, the connection too (stops syncing). id is "sb-<uuid>".
export async function deleteBankAccount(sbId) {
  const c = sb(); if (!c) return;
  const realId = String(sbId).replace(/^sb-/, "");
  const { data: acc } = await c.from("mt_accounts").select("bank_connection_id").eq("id", realId).maybeSingle();
  await c.from("mt_accounts").delete().eq("id", realId);
  const connId = acc?.bank_connection_id;
  if (connId) {
    const { data: rest } = await c.from("mt_accounts").select("id").eq("bank_connection_id", connId);
    if (!rest || rest.length === 0) await c.from("mt_bank_connections").delete().eq("id", connId);
  }
}

// Persist a bank account's starting balance (and name/color) to the cloud so it syncs everywhere.
export async function updateBankAccount(sbId, fields) {
  const c = sb(); if (!c) return;
  const realId = String(sbId).replace(/^sb-/, "");
  const patch = {};
  if (fields.ib != null) patch.initial_balance = Number(fields.ib) || 0;
  if (fields.name != null) patch.name = fields.name;
  if (fields.color != null) patch.color = fields.color;
  if (Object.keys(patch).length) await c.from("mt_accounts").update(patch).eq("id", realId);
}

// Live updates: new bank transactions (from the 3x/day cron) push into the app.
export function subscribeTx(onInsert) {
  const c = sb();
  const ch = c
    .channel("mt-tx-live")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "mt_transactions" }, (p) => onInsert(mapTx(p.new)))
    .subscribe();
  return () => { c.removeChannel(ch); };
}

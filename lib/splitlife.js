// ─────────────────────────────────────────────────────────────────────────────
// Splitlife link — your share of shared bills, and paying people back.
//
// Splitlife (the shared-bills app, ~/Documents/Heimat) runs on the same Supabase project
// and the same account. MoneyTrack never reads Splitlife's tables (core.md): it asks
// Splitlife's two read-only functions, made for this —
//   splitlife_feed(p_from)  your share of every bill you're on, what you paid, your payments
//   my_pairwise()           what you and each person owe each other (Splitlife's own figures)
// (supabase/migrations/20261002040000_splitlife_feed.sql in the Splitlife repo).
//
// What it does here, in the derived view only (raw transactions are never changed):
//   1. A bank expense that IS a Splitlife bill you paid (same amount, within 4 days) gets
//      "My share" = your Splitlife share, unless you set My share yourself (yours wins).
//      This is the owner's 2026-10-02 change to rule 3 in core.md: My share is automatic
//      for Splitlife bills, manual for everything else.
//   2. A bill someone else paid becomes a spending row of your share, in its category —
//      no account, so no balance moves (id "sl:<bill>", read-only here).
//   3. A bank payment to/from a person that matches a Splitlife payment (or exactly what you
//      owe / are owed) is labelled as paying back — Debt / Loan, not spending or income.
//      One that isn't in Splitlife yet is offered to record there (opens Splitlife).
// All of it is pure and deterministic, so it reads the same on every device.
// ─────────────────────────────────────────────────────────────────────────────
import { sb } from "./supabase";

// Splitlife's categories → MoneyTrack's (custom Splitlife categories read as Other)
export const SL_CAT = { rent: "rent", utilities: "rent", internet: "subscr", groceries: "groceries", eatout: "dining", transport: "transport", household: "shopping", other: "other" };

export const SPLITLIFE_URL = "https://meet-p-dev.github.io/Heimat/";

export async function fetchSplitlife(fromDate) {
  const c = sb();
  if (!c) return null;
  const [f, p] = await Promise.all([c.rpc("splitlife_feed", { p_from: fromDate }), c.rpc("my_pairwise")]);
  // not on Splitlife, or the functions aren't there yet: simply nothing to link
  if (f.error || p.error) return null;
  return { feed: f.data || [], pairs: p.data || [] };
}

const DAY = 86400000;
const days = (a, b) => Math.abs(new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / DAY;
const cents = (x) => Math.round(Math.abs(parseFloat(x) || 0) * 100);
const fold = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
const tokens = (s) => fold(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3);

// does a bank counterparty name read like this Splitlife person? (a shared name word)
export function samePerson(bankName, slName) {
  const a = new Set(tokens(bankName));
  return tokens(slName).some((w) => a.has(w));
}

// 1. which bank expenses are Splitlife bills you paid: txId → bill
export function matchBills(txs, feed, currency = "EUR") {
  const bills = feed.filter((r) => r.kind === "expense" && r.currency === currency && Number(r.i_paid) > 0)
    .sort((a, b) => (a.on_date < b.on_date ? -1 : a.on_date > b.on_date ? 1 : a.id < b.id ? -1 : 1));
  const used = new Set(), out = new Map();
  const cands = txs.filter((t) => t.type === "expense" && t.accountId).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
  for (const t of cands) {
    const amt = cents(t.amount);
    let best = null, bd = 99;
    for (const b of bills) {
      if (used.has(b.id) || Number(b.i_paid) !== amt) continue;
      const d = days(t.date, b.on_date);
      if (d <= 4 && d < bd) { best = b; bd = d; }
    }
    if (best) { used.add(best.id); out.set(t.id, best); }
  }
  return out;
}

// 2. your share of bills someone else paid, as spending rows that move no balance
export function shareRows(feed, currency = "EUR") {
  return feed.filter((r) => r.kind === "expense" && r.currency === currency && Number(r.i_paid) === 0 && Number(r.my_share) > 0)
    .map((r) => ({
      id: "sl:" + r.id, type: "expense", amount: Number(r.my_share) / 100, date: r.on_date,
      merchant: r.description || r.place_name || "Splitlife", category: SL_CAT[r.category] || "other",
      notes: `Your share in Splitlife · ${r.place_kind === "direct" ? "with friends" : r.place_name}`,
      accountId: "", _splitlife: true, _virtual: true,
    }));
}

// 3. bank payments that pay someone back: txId → { name, recorded, person, amount, direction }
export function matchPayments(txs, feed, pairs, currency = "EUR") {
  const pays = feed.filter((r) => r.kind === "payment" && r.currency === currency);
  // what you owe each person (negative) / they owe you (positive), summed over every place
  const open = new Map();
  for (const p of pairs) if (p.currency === currency) {
    const o = open.get(p.person) || { name: p.person_name, minor: 0 };
    o.minor += Number(p.minor); open.set(p.person, o);
  }
  const used = new Set(), out = new Map();
  for (const t of [...txs].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1))) {
    if (!t.accountId || !t.merchant) continue;
    const out_ = t.type === "expense" || t.type === "debit" || (t._rawType && (t._rawType === "expense" || t._rawType === "debit"));
    const in_ = t.type === "income" || t.type === "credit" || (t._rawType && (t._rawType === "income" || t._rawType === "credit"));
    if (!out_ && !in_) continue;
    const amt = cents(t.amount);
    // a payment already in Splitlife: same person, same amount, within 5 days
    const rec = pays.find((p) => !used.has(p.id) && cents(p.amount) === amt && p.direction === (out_ ? "out" : "in")
      && days(t.date, p.on_date) <= 5 && samePerson(t.merchant, p.person_name));
    if (rec) { used.add(rec.id); out.set(t.id, { name: rec.person_name, person: rec.person, recorded: true, amount: amt / 100, direction: rec.direction }); continue; }
    // not recorded yet: exactly what you owe them (or they owe you)
    for (const [person, o] of open) {
      if (!samePerson(t.merchant, o.name)) continue;
      if ((out_ && o.minor === -amt) || (in_ && o.minor === amt)) {
        out.set(t.id, { name: o.name, person, recorded: false, amount: amt / 100, direction: out_ ? "out" : "in" });
        open.delete(person);
        break;
      }
    }
  }
  return out;
}

// Splitlife's settle-up with this person and amount filled in (you still confirm there)
export const recordUrl = (m) => `${SPLITLIFE_URL}?settle=${encodeURIComponent(m.person)}&amount=${m.amount.toFixed(2)}&dir=${m.direction}`;

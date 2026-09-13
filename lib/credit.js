// Credit-card cycle math — pure functions over yyyy-mm-dd LOCAL date strings.
//
// A credit card is just an account with kind:"credit". Its getBal() balance goes
// NEGATIVE as you charge to it, so the debt you owe is simply -balance. Paying the
// bill is a transfer (cash account → card) which pushes the balance back toward 0.
// Nothing here invents a new transaction type, and because transfers are already
// excluded from every spend total, a bill payment is never double-counted as spend
// (the spend was recorded at purchase time).
//
// NEVER build dates via toISOString() here — see CLAUDE.md. All arithmetic below
// goes through ymd()/local Date constructors so calendar dates never shift by a day.

import { tod } from "./utils";

const pad = n => String(n).padStart(2, "0");
// m is 0-indexed, matching the Date constructor
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
// A statement day of 31 must fall back to the 30th/28th in shorter months.
const clampDay = (y, m, day) => Math.min(Math.max(parseInt(day) || 1, 1), daysIn(y, m));
const parse = s => { const [y, m, d] = s.split("-").map(Number); return { y, m: m - 1, d }; };
const prevMonth = (y, m) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
const nextMonth = (y, m) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });

export const isCredit = a => a?.kind === "credit";

// Whole days from a to b (negative if b is before a). Rounds away any DST hour shift.
export const daysBetween = (a, b) =>
  Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);

// The most recent statement close ON or BEFORE ref. Charges up to and including this
// date are on the bill that's now due; anything after it rolls to the next bill.
export function lastStatementDate(statementDay, ref = tod()) {
  const { y, m, d } = parse(ref);
  const thisMonth = clampDay(y, m, statementDay);
  if (d >= thisMonth) return ymd(y, m, thisMonth);
  const p = prevMonth(y, m);
  return ymd(p.y, p.m, clampDay(p.y, p.m, statementDay));
}

export function prevStatementDate(statementDay, ref = tod()) {
  const { y, m } = parse(lastStatementDate(statementDay, ref));
  const p = prevMonth(y, m);
  return ymd(p.y, p.m, clampDay(p.y, p.m, statementDay));
}

export function nextStatementDate(statementDay, ref = tod()) {
  const { y, m } = parse(lastStatementDate(statementDay, ref));
  const n = nextMonth(y, m);
  return ymd(n.y, n.m, clampDay(n.y, n.m, statementDay));
}

// When the bill that closed on `close` must be paid. If the due day falls after the
// close day it lands in the same month (close 5th → due 20th); otherwise it rolls to
// the next month (close 25th → due 15th), which is the common case.
export function dueDateFor(close, dueDay) {
  const { y, m, d } = parse(close);
  const same = clampDay(y, m, dueDay);
  if (same > d) return ymd(y, m, same);
  const n = nextMonth(y, m);
  return ymd(n.y, n.m, clampDay(n.y, n.m, dueDay));
}

// Signed effect of one transaction on the card's balance.
// Negative = deeper in debt. Uses FULL amounts, never the split share: the bank bills
// you the whole charge regardless of who you're splitting it with. (personalAmt is for
// spend analytics; this is what you actually owe.)
const cardDelta = (t, cardId) => {
  const v = parseFloat(t.amount) || 0;
  if (t.accountId === cardId) {
    if (t.type === "expense") return -v;   // a charge
    if (t.type === "income") return v;     // refund / cashback / statement credit
    if (t.type === "credit") return v;     // money onto the card, not income (e.g. reclassified refund)
    if (t.type === "debit") return -v;     // money off the card, not spend
    if (t.type === "transfer") return -v;  // cash advance — money pulled off the card
  }
  if (t.toAccountId === cardId && t.type === "transfer") return v; // bill payment
  return 0;
};

export const isPayment = (t, cardId) => t.type === "transfer" && t.toAccountId === cardId;

// ── Starting-balance date (V11.8) ──
// An account's starting balance (ib) is a SNAPSHOT: "on this date I had / owed X". Anything
// dated before that is already inside X. Without a date the app had to assume X came before
// ALL transactions, so older ones were counted a second time — e.g. bank-synced card-bill
// payments from months before the card data you typed in, or old entries added by hand
// later. `ibDate` fixes that for every hand-managed account: transactions ON or AFTER it
// count; earlier ones stay in your history and stats but don't move the balance again.
// No ibDate = the old behaviour (everything counts). Bank-synced accounts never get one —
// their ib is set so that ib + synced history = the real bank balance.
export const countsFor = (acc, t) => !acc?.ibDate || (t?.date || "") >= acc.ibDate;
export const isBankAcc = a => !!a && (!!a._bank || String(a.id || "").startsWith("sb-"));

const addDays = (s, n) => { const { y, m, d } = parse(s); const dt = new Date(y, m, d + n); return ymd(dt.getFullYear(), dt.getMonth(), dt.getDate()); };

// Best guess for when a hand-managed account's starting balance was taken — only ever
// OFFERED (Home alert → account sheet), never applied silently. Cards: the day after the
// last statement that closed before your first purchase on the card (people start from a
// statement). Other accounts: the day of the first transaction entered on it.
export function suggestStartDate(acc, txs) {
  const own = txs.filter(t => t.accountId === acc.id && t.date).map(t => t.date).sort();
  if (!own.length) return null;
  const first = own[0];
  if (isCredit(acc) && parseInt(acc.statementDay)) {
    let close = lastStatementDate(acc.statementDay, first);
    if (close >= first) close = prevStatementDate(acc.statementDay, first);
    return addDays(close, 1);
  }
  return first;
}

// Everything the card UI needs, derived purely from the account + the tx list.
export function cardStats(card, txs, ref = tod()) {
  const limit = parseFloat(card.creditLimit) || 0;
  const apr = parseFloat(card.apr) || 0;
  const stmtDay = parseInt(card.statementDay) || 1;
  const dueDay = parseInt(card.dueDay) || 1;

  const close = lastStatementDate(stmtDay, ref);
  const nextClose = nextStatementDate(stmtDay, ref);
  const due = dueDateFor(close, dueDay);
  // Only what happened on/after the card's starting-balance date — older rows are already in ib.
  const mine = txs.filter(t => (t.accountId === card.id || t.toAccountId === card.id) && countsFor(card, t));
  const balAsOf = cut =>
    mine.filter(t => t.date <= cut).reduce((s, t) => s + cardDelta(t, card.id), parseFloat(card.ib) || 0);

  // Owed right now, across everything — billed and unbilled alike.
  const currentBalance = -balAsOf(ref);
  // What the last statement said you owe. This is the number the bank wants on the due date.
  const statementBalance = -balAsOf(close);
  const paidSinceStatement = mine
    .filter(t => t.date > close && isPayment(t, card.id))
    .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const amountDue = Math.max(statementBalance - paidSinceStatement, 0);
  // Charged since the statement closed — not yet billed, rolls onto the next bill.
  const unbilled = -mine
    .filter(t => t.date > close && !isPayment(t, card.id))
    .reduce((s, t) => s + cardDelta(t, card.id), 0);

  const available = limit - currentBalance;
  const util = limit > 0 ? currentBalance / limit : 0;

  // Cycle pace: how fast you're charging this cycle, projected to the next close.
  const cycleLen = Math.max(daysBetween(close, nextClose), 1);
  const cycleElapsed = Math.min(Math.max(daysBetween(close, ref), 0), cycleLen);
  const projectedCycle = cycleElapsed > 0 ? (unbilled / cycleElapsed) * cycleLen : unbilled;

  const daysToDue = daysBetween(ref, due);
  // Interest you'd eat next month by NOT clearing the statement — one month at APR/12.
  const interestEst = apr > 0 && amountDue > 0 ? amountDue * (apr / 100 / 12) : 0;

  return {
    limit, apr, close, nextClose, due,
    currentBalance, statementBalance, amountDue, unbilled, paidSinceStatement,
    available, util, overLimit: limit > 0 && currentBalance > limit,
    cycleLen, cycleElapsed, cycleLeft: Math.max(cycleLen - cycleElapsed, 0), projectedCycle,
    daysToDue, dueSoon: amountDue > 0 && daysToDue <= 7, overdue: amountDue > 0 && daysToDue < 0,
    interestEst, paidInFull: amountDue <= 0 && statementBalance > 0,
  };
}

// Charges per statement period, oldest → newest, for the bill-history chart.
export function billHistory(card, txs, n = 12, ref = tod()) {
  const stmtDay = parseInt(card.statementDay) || 1;
  const out = [];
  let close = lastStatementDate(stmtDay, ref);
  for (let i = 0; i < n; i++) {
    const start = prevStatementDate(stmtDay, close);
    const charged = txs
      .filter(t => t.accountId === card.id && t.type === "expense" && t.date > start && t.date <= close)
      .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const { y, m } = parse(close);
    out.unshift({ close, start, charged, label: new Date(y, m, 1).toLocaleString("default", { month: "short" }) });
    close = start;
  }
  return out;
}

// Utilisation colour — 30% is the threshold that matters for credit scoring.
export const utilTone = (util, T) => (util >= 0.9 ? T.red : util >= 0.7 ? "#fb923c" : util >= 0.3 ? "#fbbf24" : T.green);
export const utilLabel = util =>
  util >= 0.9 ? "Very high" : util >= 0.7 ? "High" : util >= 0.3 ? "Moderate" : "Healthy";

// ── Credit-card bill detection (V11.7) ──
// Does this bank DEBIT pay a credit-card bill? Banks and people word it every which way —
// "Kreditkartenabrechnung", "Mastercard Abrechnung", "creditcard bill", "VISA Rechnung",
// or just the issuer ("Advanzia", "Barclaycard") — so this recognises all of those without
// the user typing anything. It must NOT fire on ordinary spending: a Debit-Mastercard or
// girocard PURCHASE also says "Mastercard"/"Visa", and Sparkasse's own fee statement is
// titled "Abrechnung". Hence the tiers:
//   1. unmistakable bill phrases           → yes
//   2. debit-card purchase wording         → no
//   3. a credit-card-only issuer's name    → yes
//   4. network name (Mastercard/Visa/Amex) → yes only WITH a bill word, or when the debit is
//      money you moved to yourself (you paying your own card is exactly that)
const RE_CC_STRONG  = /\b(kreditkarten?|kreditkarten(abrechnung|rechnung|konto|ausgleich|saldo|zahlung)|credit ?cards?|kk[- ]?abrechnung|kartenabrechnung|card ?bill|card statement|cc ?bill)\b/i;
const RE_CC_NOT     = /\b(debit ?mastercard|mastercard ?debit|visa ?debit|debit ?card|debitkarte|girocard|kartenzahlung|kartenumsatz|apple ?pay|google ?pay)\b/i;
const RE_CC_ISSUER  = /\b(advanzia|gebührenfrei|gebuehrenfrei|awa ?7|barclaycard|american express|hanseatic|tf ?bank)\b/i;
const RE_CC_NETWORK = /\b(master ?card|mc|visa|amex)\b/i;
const RE_CC_BILLWORD= /\b(abrechnung|rechnung|bill|statement|saldo|ausgleich|tilgung|r[uü]ckzahlung|rueckzahlung|repayment|payoff)\b/i;
export function looksLikeCardBill(text, { ownTransfer = false } = {}) {
  const s = String(text || "");
  if (!s.trim()) return false;
  if (RE_CC_STRONG.test(s)) return true;
  if (RE_CC_NOT.test(s)) return false;
  if (RE_CC_ISSUER.test(s)) return true;
  if (RE_CC_NETWORK.test(s)) return RE_CC_BILLWORD.test(s) || ownTransfer;
  return false;
}

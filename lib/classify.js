// ─────────────────────────────────────────────────────────────────────────────
// Bank-transaction evidence engine (v2)
//
// v1 was a first-match rule ladder. It broke on the real world: the SAME person
// sends you rent in April, a Splitwise settlement in May, and borrows €20 in
// June. A per-person rule can't hold three meanings at once.
//
// v2 scores every possible meaning ("label") of a transaction by accumulating
// independent pieces of evidence, then decides only when the numbers are
// decisive — otherwise it holds the transaction for review. Structure:
//
//   score(label) = ln P(label | payee history)      ← learned Bayesian prior
//                + Σ  weight(evidence, label)        ← keyword/amount/pairing signals
//   confidence   = softmax(scores)[best]
//
//   confidence ≥ AUTO       → apply silently, with a human-readable reason
//   confidence ≥ PROVISIONAL→ apply best guess as a NEUTRAL credit + flag review
//   below                   → neutral "other" credit + flag review
//
// Cross-transaction detectors (things no single-row rule can see):
//   • refund pairing   — a credit that mirrors a past debit (same payee or, for
//     payment processors, same amount) is a refund, not income
//   • mirror transfers — a debit in one of your accounts and a credit in another,
//     same amount within days, is you moving your own money
//   • rent pass-through netting — the monthly landlord debit minus the rent
//     collected from flatmates that month = YOUR real share. This self-corrects:
//     if a flatmate nets a Splitwise debt out of their rent transfer, the
//     shortfall lands in your share — which is exactly what it cost you.
//
// Learning: every user decision increments per-payee label counts
// (mt-payee-stats). With a Dirichlet-smoothed prior, one correction shifts the
// odds hard; repeated confirmations make the payee near-certain, while a payee
// with genuinely mixed history (rent one month, settlement the next) keeps a
// mixed prior and lets the per-transaction evidence decide. Nothing here is
// specific to one user — it learns anyone's people.
// ─────────────────────────────────────────────────────────────────────────────

// Labels and the (type, category) each writes into the app.
// type "credit"/"debit" = money moved but is NOT income/spend (see App overlay).
export const LABELS = ["salary", "freelance", "refund", "transfer", "reimburse", "debt", "other"];
export const LABEL_CLS = {
  salary:    { type: "income", category: "salary" },
  freelance: { type: "income", category: "freelance" },
  refund:    { type: "credit", category: "refund" },
  transfer:  { type: "credit", category: "transfer" },
  reimburse: { type: "credit", category: "reimburse" },
  debt:      { type: "credit", category: "debt" },
  other:     { type: "credit", category: "other" },
};

const AUTO = 0.70, PROVISIONAL = 0.45;   // confidence thresholds
const ALPHA = 0.5;                        // Dirichlet smoothing for payee priors

import { merchantCategory } from "./merchants";

const norm = s => (s || "").toLowerCase();
const RE_REFUND    = /\b(refund|return|erstattung|r[uü]ckzahlung|reversal|chargeback|gutschrift|storno|rueckerstattung)\b/i;
const RE_SALARY    = /\b(gehalt|lohn|salary|payroll|bez[uü]ge|besoldung|entgelt|arbeitgeber|wage|wages)\b/i;
const RE_SALARY_W  = /\b(schicht|shift|zenjob|minijob)\b/i;
const RE_FREELANCE = /\b(honorar|freelance|invoice|auftrag|freiberuf|payout|upwork|fiverr)\b/i;
const RE_RENT      = /\b(rent|miete|kaltmiete|warmmiete|nebenkosten|wg)\b/i;
const RE_SETTLE    = /\b(splitwise|settle|settlement|ausgleich|anteil|share)\b/i;
const RE_LOAN      = /\b(loan|leihe|geliehen|borrow|darlehen|kredit|zur[uü]ck|payback|pay back)\b/i;
const RE_P2P       = /\b(paypal|revolut|wise|tikkie|instant transfer|echtzeit|[uü]berweisung|sent from|request money)\b/i;
const RE_ORG       = /\b(gmbh|ag|se\b|kg\b|ug\b|ohg|mbh|ltd|inc\b|co\b|corp|bank|sparkasse|volksbank|amazon|zalando|adyen|stripe|klarna|sumup|mollie|logistik|fulfillment|payments?|service|versicherung|energie|stadtwerke|telekom|vodafone|krankenkasse)\b/i;
// Payment processors: refunds arrive under THEIR name, so pair by amount alone.
const RE_PSP       = /\b(adyen|paypal|klarna|stripe|sumup|mollie|zalando payments|worldpay|checkout)\b/i;

export function counterpartyKey(tx) {
  const iban = tx.counterIban || tx._iban;
  if (iban) return "iban:" + String(iban).replace(/\s+/g, "").toLowerCase();
  const name = norm(tx.merchant).replace(/\s+/g, " ").trim();
  return name ? "name:" + name : "";
}

export function looksLikePerson(name) {
  const n = (name || "").trim();
  if (!n || RE_ORG.test(n)) return false;
  const words = n.split(/\s+/).filter(Boolean);
  return words.length >= 2 && words.length <= 4 && /^[\p{L}.\-' ]+$/u.test(n);
}

function isOwnName(name, ownTokens) {
  const m = norm(name);
  if (!m || !ownTokens.length) return false;
  return ownTokens.filter(t => t.length >= 3 && m.includes(t)).length >= 2;
}

// Your own name tokens: explicit owner name + any personal name that appears as
// counterparty on BOTH a credit and a debit (money flows both ways ⇒ your own account).
export function deriveOwnTokens(txs, ownerName) {
  const set = new Set();
  norm(ownerName).split(/\s+/).forEach(t => { if (t.length >= 3) set.add(t); });
  const credited = new Set(), debited = new Set();
  txs.forEach(t => {
    if (!t._bank || !looksLikePerson(t.merchant)) return;
    const n = norm(t.merchant).trim();
    if (t.type === "income") credited.add(n);
    else if (t.type === "expense") debited.add(n);
  });
  credited.forEach(n => { if (debited.has(n)) n.split(/\s+/).forEach(w => { if (w.length >= 3) set.add(w); }); });
  return [...set];
}

const epochDay = d => Math.floor(new Date(d + "T00:00:00") / 86400000);
const softmax = scores => {
  const mx = Math.max(...Object.values(scores));
  let z = 0; const e = {};
  for (const l of LABELS) { e[l] = Math.exp((scores[l] ?? -9) - mx); z += e[l]; }
  for (const l of LABELS) e[l] /= z;
  return e;
};

// Apply a stored user decision to a bank row — WITHOUT letting it reverse the cash
// direction. The bank is the authority on whether money came IN or went OUT; a decision
// only says what that movement MEANS (salary vs refund vs own transfer vs …).
//
// Why this guard exists: the edit sheet writes {type,category} decisions, and the money-in
// types (income/credit) and money-out types (expense/debit) share that one field. A single
// mis-tap on a debit therefore used to flip a −€21 row into +€21 — a €42 swing — and,
// because decisions are permanent and cloud-synced, it survived every re-sync and every
// re-import. Clamping here fixes those rows retroactively: no migration needed.
const IN_TYPES = ["income", "credit"], OUT_TYPES = ["expense", "debit"];
function applyDecision(dec, dir) {
  const allowed = dir === "in" ? IN_TYPES : OUT_TYPES;
  const kept = allowed.includes(dec.type) ? dec.type : allowed[allowed.length - 1]; // credit / debit
  const clamped = kept !== dec.type;
  return {
    ...dec, type: kept, reviewed: true, needsReview: false, confidence: 1,
    reason: clamped
      ? `you set this — kept as money ${dir} (your bank booked it that way)`
      : "you set this",
    ...(clamped ? { _clamped: true } : {}),
  };
}

// ── The main pass: classify every bank transaction against the whole ledger. ──
// Returns Map(tx.id → {type, category, label, confidence, needsReview, reason,
// suggest:[label…], shareAmt?}). Non-bank txs are never touched.
export function classifyAll(txs, { ownerName = "", payeeStats = {}, txDecisions = {} } = {}) {
  const out = new Map();
  const ownTokens = deriveOwnTokens(txs, ownerName);
  const bank = txs.filter(t => t._bank);

  // Indexes for cross-transaction evidence
  const debitAmts = new Map();               // cents → [debit tx]
  const byPayee = new Map();                 // key → [tx]
  bank.forEach(t => {
    const k = counterpartyKey(t);
    if (k) { if (!byPayee.has(k)) byPayee.set(k, []); byPayee.get(k).push(t); }
    if (t.type === "expense") {
      const c = Math.round((+t.amount || 0) * 100);
      if (!debitAmts.has(c)) debitAmts.set(c, []);
      debitAmts.get(c).push(t);
    }
  });
  // Mirror transfers: credit in account A + debit in account B, same amount ±1%, within 3 days
  const mirrored = new Set();
  const credits = bank.filter(t => t.type === "income");
  const debits  = bank.filter(t => t.type === "expense");
  credits.forEach(cr => {
    const a = +cr.amount || 0; if (a < 1) return;
    const hit = debits.find(db => db.accountId !== cr.accountId &&
      Math.abs((+db.amount || 0) - a) <= a * 0.01 &&
      Math.abs(epochDay(db.date) - epochDay(cr.date)) <= 3 && !mirrored.has(db.id));
    if (hit) { mirrored.add(cr.id); mirrored.add(hit.id); }
  });
  // Monthly recurrence: payee has ≥2 txs ~a month apart with similar amounts
  const recurring = new Set();
  byPayee.forEach((list, k) => {
    const days = list.map(t => epochDay(t.date)).sort((x, y) => x - y);
    for (let i = 1; i < days.length; i++)
      if (days[i] - days[i - 1] >= 24 && days[i] - days[i - 1] <= 38) { recurring.add(k); break; }
  });

  // ── Score each credit ──
  credits.forEach(t => {
    // absolute overrides first — but see applyDecision: a decision re-labels, it never
    // reverses the direction the bank actually booked.
    if (txDecisions[t.id]) { out.set(t.id, applyDecision(txDecisions[t.id], "in")); return; }

    const key = counterpartyKey(t);
    const text = `${t.merchant || ""} ${t.notes || ""}`;
    const person = looksLikePerson(t.merchant);
    const amt = +t.amount || 0;
    const why = [];   // evidence trail, most decisive first

    // Bayesian prior from this payee's confirmed history
    const stats = (key && payeeStats[key]?.counts) || {};
    const N = Object.values(stats).reduce((s, n) => s + n, 0);
    const s = {};
    LABELS.forEach(l => { s[l] = Math.log(((stats[l] || 0) + ALPHA) / (N + ALPHA * LABELS.length)); });
    if (N > 0) { const top = Object.entries(stats).sort((a, b) => b[1] - a[1])[0]; why.push(`you've marked ${t.merchant} as ${top[0]} before`); }

    const add = (label, w) => { s[label] += w; };

    if (isOwnName(t.merchant, ownTokens)) { add("transfer", 4); why.push("counterparty is you — own-account transfer"); }
    if (mirrored.has(t.id))               { add("transfer", 3); why.push("mirrors a debit from your other account (same amount, same days)"); }
    if (RE_REFUND.test(text))             { add("refund", 3);   why.push("refund wording in the description"); }
    // refund pairing: this credit's amount matches a past debit
    const cents = Math.round(amt * 100);
    const pastDebits = (debitAmts.get(cents) || []).filter(d => epochDay(t.date) - epochDay(d.date) >= 0 && epochDay(t.date) - epochDay(d.date) <= 90);
    if (pastDebits.some(d => counterpartyKey(d) === key)) { add("refund", 3); why.push(`matches your earlier payment of the same amount to ${t.merchant}`); }
    else if (pastDebits.length && RE_PSP.test(text))      { add("refund", 2); why.push("payment processor credit matching an earlier charge"); }

    if (RE_SALARY.test(text))   { add("salary", 4);   why.push("salary wording (Lohn/Gehalt)"); }
    if (RE_SALARY_W.test(text)) { add("salary", 1.5); }
    if (RE_FREELANCE.test(text)){ add("freelance", 3); why.push("invoice/freelance wording"); }
    if (person && RE_RENT.test(text))   { add("reimburse", 3); why.push("rent wording from a person — collected share, not income"); }
    if (RE_SETTLE.test(text))           { add("reimburse", 2.5); why.push("settlement wording (Splitwise/settle)"); }
    if (RE_LOAN.test(text))             { add("debt", 2.5); why.push("loan wording"); }
    if (person) { add("reimburse", 1); add("salary", -1.5); add("freelance", -1.5); }
    if (person && amt >= 800 && !RE_RENT.test(text)) { add("debt", 2); add("salary", -2); why.push(`large amount (€${amt.toFixed(0)}) from a person — could be a loan`); }
    if (RE_P2P.test(text)) { add("transfer", 1); add("reimburse", 1); }
    if (person && amt >= 20 && Math.abs(amt - Math.round(amt / 5) * 5) < 0.001) { add("reimburse", 0.5); add("transfer", 0.5); add("salary", -1); }
    if (recurring.has(key)) { if (person) add("reimburse", 1); else { add("salary", 1); } }
    if (!person && !RE_SALARY.test(text) && !RE_REFUND.test(text) && !pastDebits.length) add("other", 0.5);

    const p = softmax(s);
    const ranked = LABELS.slice().sort((a, b) => p[b] - p[a]);
    const best = ranked[0], conf = p[best];

    if (conf >= AUTO) {
      out.set(t.id, { ...LABEL_CLS[best], label: best, confidence: conf, needsReview: false, reason: why[0] || "pattern match", suggest: ranked.slice(0, 3) });
    } else if (conf >= PROVISIONAL && LABEL_CLS[best].type === "credit") {
      out.set(t.id, { ...LABEL_CLS[best], label: best, confidence: conf, needsReview: true, reason: (why[0] || "unclear") + " — please confirm", suggest: ranked.slice(0, 3) });
    } else {
      out.set(t.id, { ...LABEL_CLS.other, label: "other", confidence: conf, needsReview: true, reason: "not sure what this incoming money is — please confirm", suggest: ranked.slice(0, 3) });
    }
  });

  // ── Debits: own-transfer detection, then categorisation of real spend ──
  debits.forEach(t => {
    if (txDecisions[t.id]) { out.set(t.id, applyDecision(txDecisions[t.id], "out")); return; }
    if (isOwnName(t.merchant, ownTokens) || mirrored.has(t.id)) {
      out.set(t.id, { type: "debit", category: "transfer", label: "transfer", confidence: 0.95, needsReview: false, reason: "transfer to your own account" });
      return;
    }
    // What you taught for this payee beats everything below it, and applies even when the
    // bank already guessed a category (your correction should stick).
    const key = counterpartyKey(t);
    const taught = key && payeeStats[key]?.cat;
    if (taught) {
      out.set(t.id, { type: "expense", category: taught, label: "expense", confidence: 1, needsReview: false, reason: `you categorise ${t.merchant} as this` });
      return;
    }
    // Shared merchant prior — only fills a category the bank left as "other", so a known
    // shop reads correctly on day one without any learning history.
    if ((t.category || "other") === "other") {
      const cat = merchantCategory(t.merchant);
      if (cat) out.set(t.id, { type: "expense", category: cat, label: "expense", confidence: 0.8, needsReview: false, reason: `${t.merchant} is a known merchant` });
    }
  });

  // NOTE: automatic rent pass-through netting was removed — guessing which collected
  // credits belong to which landlord debit was unreliable on real, messy data. Your share
  // of a shared expense is now set explicitly via the "My share" field on the transaction
  // (stored as a manual override in the app), which is predictable and trustworthy.

  return out;
}

// Bump a payee's label count when the user confirms/corrects (weight 3 ⇒ one tap
// dominates the smoothed prior; mixed histories stay mixed). Spreads `cur` so a taught
// expense category (`cat`) on the same payee isn't wiped.
export function bumpPayeeStats(stats, key, label, w = 3) {
  if (!key || !LABELS.includes(label)) return stats;
  const cur = stats[key] || {};
  const counts = cur.counts || {};
  return { ...stats, [key]: { ...cur, counts: { ...counts, [label]: (counts[label] || 0) + w } } };
}

// Remember the expense CATEGORY a user picked for a payee (e.g. SumUp → dining), so the
// correction generalises to every future transaction from them instead of just that row.
// Lives alongside the label counts, so it cloud-syncs with the rest of the learning.
export function setPayeeCat(stats, key, cat) {
  if (!key || !cat) return stats;
  return { ...stats, [key]: { ...(stats[key] || {}), cat } };
}

// Migrate v1 single-rule store (mt-payee-rules) into stats seeds.
export function migrateRulesToStats(rules) {
  const stats = {};
  for (const [key, cls] of Object.entries(rules || {})) {
    const label = LABELS.find(l => LABEL_CLS[l].category === cls.category && LABEL_CLS[l].type === cls.type)
      || (cls.type === "income" ? "salary" : "other");
    stats[key] = { counts: { [label]: 3 } };
  }
  return stats;
}

// Review-inbox choices (order = display order). `label` feeds the learner.
export const REVIEW_CHOICES = [
  { key: "income",    label: "Income",        sub: "Salary, freelance, real earnings",        cls: LABEL_CLS.salary },
  { key: "reimburse", label: "Reimbursement", sub: "Rent share, Splitwise, friend pays back",  cls: LABEL_CLS.reimburse },
  { key: "transfer",  label: "My transfer",   sub: "Between your own accounts",                cls: LABEL_CLS.transfer },
  { key: "refund",    label: "Refund",        sub: "Money returned for a purchase",            cls: LABEL_CLS.refund },
  { key: "debt",      label: "Loan / payback",sub: "Borrowed money, or a loan repaid to you",  cls: LABEL_CLS.debt },
];

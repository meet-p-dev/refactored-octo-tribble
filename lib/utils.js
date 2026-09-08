import { CURRENCIES } from "./constants";

export const LS = {
  g: k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  s: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Mutable, non-React singleton — read fresh by fmt()/mtSym() on every call so
// currency switches are reflected immediately, without threading curId through
// every call site. Mirrors the equivalent window.__mtCurId global from core.jsx.
let _curId = typeof window !== "undefined" ? (LS.g("mt-currency") || "de-DE") : "de-DE";
export const getCurId = () => _curId;
export const setCurrencyId = id => { _curId = id; };
export const mtCur = () => CURRENCIES.find(c => c.id === _curId) || CURRENCIES[0];
export const mtSym = () => mtCur().sym;
export const fmt = n => {
  const c = mtCur();
  return new Intl.NumberFormat(c.loc, { style: "currency", currency: c.cur }).format(n || 0);
};

// The decimal separator for the active region — "," for de-DE/fr-FR, "." for en-US.
// Amounts are always STORED canonically with a dot; only what the user sees and types
// is localized (see AmountInput in components/form.jsx).
export const decSep = () =>
  new Intl.NumberFormat(mtCur().loc).formatToParts(1.1).find(p => p.type === "decimal")?.value || ".";

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const tod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// personal share helper — used everywhere for consistent expense amounts.
// _shareAmt is set by the classifier's pass-through netting (e.g. the landlord
// debit minus rent collected from flatmates = YOUR real share of the rent).
export const personalAmt = t => {
  if (t._shareAmt != null && t.type === "expense") return t._shareAmt;
  const v = parseFloat(t.amount) || 0;
  return t.isSplit && t.type === "expense" ? v / Math.max(t.splitPeople || 1, 1) : v;
};

// Haptic feedback was removed (unreliable across devices). These remain as no-ops so the
// many haptic() call sites keep working without change; setHapticsEnabled is a no-op too.
export const setHapticsEnabled = () => {};
export const haptic = () => {};

export const MT_VERSION = process.env.NEXT_PUBLIC_MT_VERSION || "dev";

// Fire a real OS/browser notification. No-op unless the user enabled notifications
// (mt-notif-enabled) AND the browser granted permission. Used when the bank pulls new
// transactions. Safe to call anywhere — all the guards live here.
export const notify = (title, body) => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (LS.g("mt-notif-enabled") === false) return;
    new Notification(title, { body });
  } catch {}
};

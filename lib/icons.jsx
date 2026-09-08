export const I = {
  home:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 4l9 8"/><path d="M5 10.5V20h5v-5h4v5h5V10.5"/></svg>,
  list:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill={c} stroke="none"/><circle cx="4" cy="12" r="1.5" fill={c} stroke="none"/><circle cx="4" cy="18" r="1.5" fill={c} stroke="none"/></svg>,
  people:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="18" cy="8" r="2.5"/><path d="M21 20c0-2.8-1.9-5-4.5-5.5"/></svg>,
  goal:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  chart:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  wallet:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M2 7.5L12 3l10 4.5"/><circle cx="17" cy="14" r="1.5" fill={c} stroke="none"/></svg>,
  plus:(c,s=26)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:c=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
  trash:c=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  moon:c=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  sun:c=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  srch:c=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  x:c=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back:c=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  back2:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><polyline points="9 6 15 12 9 18" transform="rotate(180 12 12)"/></svg>,
  settings:c=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  download:c=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload:c=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  check:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  bell:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  lock:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  budget:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-9-9v9z"/><path d="M21 12a9 9 0 00-9-9"/></svg>,
  spark:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9 14 11l-2 4.5L10 11 5.5 9l4.7-1.3z"/><circle cx="18.5" cy="17.5" r="1.5"/><circle cx="5" cy="16" r="1"/></svg>,
  flame:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s5 4 5 9a5 5 0 01-10 0c0-1.5.6-2.8 1.5-3.8C8.8 8 9 9.5 10 10c0-2 .5-5 2-8z"/></svg>,
  card:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>,
  clock:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>,
  // ── category / status symbols (replace chrome emojis; user-content emoji still allowed) ──
  cart:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.4a1.8 1.8 0 001.8 1.6h8.4a1.8 1.8 0 001.8-1.5L21.5 8H6"/></svg>,
  food:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M7 2v8M4.5 2v5.5a2.5 2.5 0 005 0V2"/><path d="M7 12v10"/><path d="M17 2c-2 2.5-2.5 6-1 9h2v11"/></svg>,
  phone:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5"/></svg>,
  car:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M5 11l1.7-4.5A2 2 0 018.6 5h6.8a2 2 0 011.9 1.5L19 11"/><path d="M3.5 11h17a1.5 1.5 0 011.5 1.5V17h-2.5M2 17V12.5A1.5 1.5 0 013.5 11M6.5 17H2m15.5 0h-11"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>,
  bag:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1.2 13a1.8 1.8 0 01-1.8 2H6.6a1.8 1.8 0 01-1.8-2z"/><path d="M8.5 10V6.5a3.5 3.5 0 017 0V10"/></svg>,
  heart:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15 3.5 8.9A4.6 4.6 0 0112 6a4.6 4.6 0 018.5 2.9c0 6.1-8.5 11.6-8.5 11.6z"/></svg>,
  play:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>,
  brief:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="7" width="19" height="13" rx="2.5"/><path d="M8.5 7V5a2 2 0 012-2h3a2 2 0 012 2v2M2.5 12.5h19"/></svg>,
  laptop:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4.5" width="16" height="11" rx="2"/><path d="M2 19.5h20"/></svg>,
  house:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v10h13V10"/></svg>,
  swap:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="17 4 21 8 17 12"/><path d="M21 8H7"/><polyline points="7 12 3 16 7 20"/><path d="M3 16h14"/></svg>,
  repeat:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="17 2 21 6 17 10"/><path d="M3 12V10a4 4 0 014-4h14"/><polyline points="7 22 3 18 7 14"/><path d="M21 12v2a4 4 0 01-4 4H3"/></svg>,
  undo:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M4 9h10a6 6 0 016 6v1"/></svg>,
  scale:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M8 21h8M5 7l7-3 7 3"/><path d="M5 7l-2.5 6a3 3 0 005 0zM19 7l-2.5 6a3 3 0 005 0z"/></svg>,
  box:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><polyline points="3 8 12 13 21 8"/><line x1="12" y1="13" x2="12" y2="21"/></svg>,
  gem:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9.5 3L8 9l4 12M14.5 3L16 9l-4 12"/></svg>,
  trendUp:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>,
  calendar:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2.5" x2="8" y2="7"/><line x1="16" y1="2.5" x2="16" y2="7"/></svg>,
  alert:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13.5"/><circle cx="12" cy="17" r="0.4" fill={c}/></svg>,
  // ── goal symbols (the icon set had no travel/education/leisure glyphs) ──
  plane:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 12.5L3 10.2V8l2 .6 1.6 1.2 3.4-.9-4-5.6V2l2.2.9L13 8.2l4.6-1.2a2 2 0 011 3.9l-4.6 1.2-1.4 6.6L10.4 21l-.6-1.7 1.6-3.3-.9-3.4-1.2 1.6-.6 2H6.6z"/></svg>,
  grad:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4L2 9l10 5 10-5z"/><path d="M6 11.5V17c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5.5"/><path d="M21 9.5V15"/></svg>,
  beach:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a9 9 0 019 8H3a9 9 0 019-8z"/><path d="M12 12v9"/><path d="M9 21h6"/></svg>,
  gift:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9S10.5 3 7.8 3a2.4 2.4 0 000 4.8M12 9s1.5-6 4.2-6a2.4 2.4 0 010 4.8"/></svg>,
  pill:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/></svg>,
  paw:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><ellipse cx="6" cy="10" rx="2" ry="2.6"/><ellipse cx="10" cy="5.8" rx="2" ry="2.6"/><ellipse cx="14" cy="5.8" rx="2" ry="2.6"/><ellipse cx="18" cy="10" rx="2" ry="2.6"/><path d="M12 12.5c3 0 5.5 2.2 5.5 4.6 0 1.9-1.6 3.1-3.4 2.6l-2.1-.6-2.1.6c-1.8.5-3.4-.7-3.4-2.6 0-2.4 2.5-4.6 5.5-4.6z"/></svg>,
};

// Glyphs safe for the symbol pickers: every one accepts a `size` argument.
// (14 of the chrome icons hardcode their dimensions and are deliberately excluded.)
export const SYM_KEYS = [
  "cart","food","phone","car","bag","heart","play","brief","laptop","house",
  "swap","repeat","undo","scale","box","gem","trendUp","calendar","alert",
  "goal","people","wallet","card","clock","flame","spark","budget",
  "plane","grad","beach","gift","pill","paw",
];

// The 12 goal symbols offered in the picker, and the emoji each one replaces.
// Goals saved before symbols existed are auto-upgraded at render time via this map,
// so no stored data has to change.
export const GOAL_SYMS = ["goal","plane","house","grad","car","laptop","play","gem","beach","gift","pill","paw"];
const EMOJI_SYM = {"🎯":"goal","✈️":"plane","🏠":"house","🎓":"grad","🚗":"car","💻":"laptop",
  "🎮":"play","💍":"gem","🏖️":"beach","🎁":"gift","💊":"pill","🐾":"paw"};

// Goal symbol — mirrors CatIcon: stored `sym` wins, then the emoji→symbol upgrade,
// then the raw emoji for anything unrecognised.
export const GoalIcon = ({ goal, size = 20, color }) => {
  const key = goal?.sym || EMOJI_SYM[goal?.icon];
  const fn = key && I[key];
  return fn ? fn(color || goal?.color || "#007aff", size) : <span style={{ fontSize: size }}>{goal?.icon || "◎"}</span>;
};

// Category symbol: renders the SVG glyph for built-in categories (cat.sym), and
// falls back to the stored emoji for user-created custom categories — emojis
// remain fine as user content, just not as app chrome.
export const CatIcon = ({ cat, size = 18, color }) => {
  const fn = cat?.sym && I[cat.sym];
  return fn ? fn(color || cat.color, size) : <span style={{ fontSize: size }}>{cat?.icon || "▦"}</span>;
};

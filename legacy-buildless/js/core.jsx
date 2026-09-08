const {useState,useEffect,useMemo,useRef}=React;

window.CATS=[
  {id:"groceries",label:"Groceries",icon:"🛒",color:"#4ade80"},
  {id:"dining",label:"Dining",icon:"🍴",color:"#fb923c"},
  {id:"subscr",label:"Subscriptions",icon:"📱",color:"#a78bfa"},
  {id:"transport",label:"Transport",icon:"🚗",color:"#60a5fa"},
  {id:"shopping",label:"Shopping",icon:"🏪",color:"#f472b6"},
  {id:"health",label:"Health",icon:"🏥",color:"#34d399"},
  {id:"entertain",label:"Entertainment",icon:"🎮",color:"#fbbf24"},
  {id:"salary",label:"Salary",icon:"💼",color:"#22c55e"},
  {id:"freelance",label:"Freelance",icon:"💻",color:"#0ea5e9"},
  {id:"rent",label:"Rent / Bills",icon:"🏠",color:"#ef4444"},
  {id:"transfer",label:"Transfer",icon:"🔄",color:"#38bdf8"},
  {id:"debt",label:"Debt / Loan",icon:"🤝",color:"#f59e0b"},
  {id:"other",label:"Other",icon:"📦",color:"#9ca3af"},
];
window.DEFACCS=[
  {id:"sparkasse",name:"Sparkasse",color:"#e11d48",ib:0},
  {id:"revolut",name:"Revolut",color:"#6d28d9",ib:0},
  {id:"revolut-savings",name:"Revolut Savings",color:"#7c3aed",ib:0},
  {id:"paypal",name:"PayPal",color:"#1d4ed8",ib:0},
  {id:"friend-loan",name:"Friend (Loan)",color:"#059669",ib:0},
];
window.LT={bg:"#f2f2f7",card:"#fff",cardH:"#f0f0f5",border:"#e5e7eb",txt:"#000",txt2:"#6b7280",txt3:"#aeaeb2",inp:"#fff",inpB:"#d1d5db",acc:"#007aff",green:"#34c759",red:"#ff3b30",cG:"#34c759",cR:"#ff3b30"};
window.DK={bg:"#000",card:"#1c1c1e",cardH:"#2c2c2e",border:"#38383a",txt:"#fff",txt2:"#8e8e93",txt3:"#48484a",inp:"#2c2c2e",inpB:"#48484a",acc:"#0a84ff",green:"#30d158",red:"#ff453a",cG:"#30d158",cR:"#ff453a"};

window.LS={
  g:k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}},
  s:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};
// Currency & region presets — each sets number format (grouping/decimal) + currency symbol.
window.CURRENCIES=[
  {id:"de-DE",country:"Germany",flag:"🇩🇪",loc:"de-DE",cur:"EUR",sym:"€"},
  {id:"fr-FR",country:"France",flag:"🇫🇷",loc:"fr-FR",cur:"EUR",sym:"€"},
  {id:"en-IE",country:"Ireland",flag:"🇮🇪",loc:"en-IE",cur:"EUR",sym:"€"},
  {id:"en-GB",country:"United Kingdom",flag:"🇬🇧",loc:"en-GB",cur:"GBP",sym:"£"},
  {id:"en-US",country:"United States",flag:"🇺🇸",loc:"en-US",cur:"USD",sym:"$"},
  {id:"en-CA",country:"Canada",flag:"🇨🇦",loc:"en-CA",cur:"CAD",sym:"$"},
  {id:"en-AU",country:"Australia",flag:"🇦🇺",loc:"en-AU",cur:"AUD",sym:"$"},
  {id:"de-CH",country:"Switzerland",flag:"🇨🇭",loc:"de-CH",cur:"CHF",sym:"CHF"},
  {id:"en-IN",country:"India",flag:"🇮🇳",loc:"en-IN",cur:"INR",sym:"₹"},
  {id:"ja-JP",country:"Japan",flag:"🇯🇵",loc:"ja-JP",cur:"JPY",sym:"¥"},
];
window.__mtCurId=window.LS.g("mt-currency")||"de-DE";
window.mtCur=()=>window.CURRENCIES.find(c=>c.id===window.__mtCurId)||window.CURRENCIES[0];
window.mtSym=()=>window.mtCur().sym;
window.fmt=n=>{const c=window.mtCur();return new Intl.NumberFormat(c.loc,{style:"currency",currency:c.cur}).format(n||0);};
window.uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
window.tod=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};
// personal share helper — used everywhere for consistent expense amounts
window.personalAmt=t=>{
  const v=parseFloat(t.amount)||0;
  return t.isSplit&&t.type==="expense"?v/Math.max(t.splitPeople||1,1):v;
};
window.haptic=(ms=10)=>{
  try{
    if(window.__mtHaptics===false)return;
    if(navigator.vibrate){navigator.vibrate(ms);return;}
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(0,ctx.currentTime);
    o.start(ctx.currentTime);o.stop(ctx.currentTime+0.01);
    ctx.close();
  }catch{}
};

window.I={
  home:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L12 4l9 8"/><path d="M5 10.5V20h5v-5h4v5h5V10.5"/></svg>,
  list:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill={c} stroke="none"/><circle cx="4" cy="12" r="1.5" fill={c} stroke="none"/><circle cx="4" cy="18" r="1.5" fill={c} stroke="none"/></svg>,
  people:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="18" cy="8" r="2.5"/><path d="M21 20c0-2.8-1.9-5-4.5-5.5"/></svg>,
  goal:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  chart:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  wallet:c=><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M2 7.5L12 3l10 4.5"/><circle cx="17" cy="14" r="1.5" fill={c} stroke="none"/></svg>,
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
  check:c=><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.5} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  bell:c=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  lock:(c,s=20)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  budget:(c,s=24)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-9-9v9z"/><path d="M21 12a9 9 0 00-9-9"/></svg>,
  spark:(c,s=18)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9 14 11l-2 4.5L10 11 5.5 9l4.7-1.3z"/><circle cx="18.5" cy="17.5" r="1.5"/><circle cx="5" cy="16" r="1"/></svg>,
  flame:(c,s=16)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s5 4 5 9a5 5 0 01-10 0c0-1.5.6-2.8 1.5-3.8C8.8 8 9 9.5 10 10c0-2 .5-5 2-8z"/></svg>,
};


window.MT_VERSION=window.MT_VERSION||"dev";

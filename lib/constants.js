// `sym` = SVG glyph key in lib/icons.jsx (chrome uses symbols, not emoji).
// `icon` emoji kept as fallback for old backups and custom user categories.
export const CATS = [
  {id:"groceries",label:"Groceries",icon:"🛒",sym:"cart",color:"#4ade80"},
  {id:"dining",label:"Dining",icon:"🍴",sym:"food",color:"#fb923c"},
  {id:"subscr",label:"Subscriptions",icon:"📱",sym:"phone",color:"#a78bfa"},
  {id:"transport",label:"Transport",icon:"🚗",sym:"car",color:"#60a5fa"},
  {id:"shopping",label:"Shopping",icon:"🏪",sym:"bag",color:"#f472b6"},
  {id:"health",label:"Health",icon:"🏥",sym:"heart",color:"#34d399"},
  {id:"entertain",label:"Entertainment",icon:"🎮",sym:"play",color:"#fbbf24"},
  {id:"salary",label:"Salary",icon:"💼",sym:"brief",color:"#22c55e"},
  {id:"freelance",label:"Freelance",icon:"💻",sym:"laptop",color:"#0ea5e9"},
  {id:"rent",label:"Rent / Bills",icon:"🏠",sym:"house",color:"#ef4444"},
  {id:"transfer",label:"Transfer",icon:"🔄",sym:"swap",color:"#38bdf8"},
  {id:"reimburse",label:"Reimbursement",icon:"🔁",sym:"repeat",color:"#2dd4bf"},
  {id:"refund",label:"Refund",icon:"↩️",sym:"undo",color:"#22d3ee"},
  {id:"debt",label:"Debt / Loan",icon:"🤝",sym:"scale",color:"#f59e0b"},
  {id:"other",label:"Other",icon:"📦",sym:"box",color:"#9ca3af"},
];

// A new install starts with NO accounts. It used to ship five guesses (Sparkasse,
// Revolut, PayPal…) which were wrong for almost everyone, showed up as real accounts
// with a 0,00 € balance, and had to be deleted one by one before the app made sense.
// Now the empty states in onboarding and Wallet → Accounts say where accounts come
// from instead: add a cash/manual one yourself, or connect a bank and let the sync
// create the real ones. Existing installs are untouched — they read mt-accs.
export const DEFACCS = [];

// V11 design system: `bg` is the canvas, `card` the first elevation, `surf2` the second
// (chips/insets sitting ON a card). `shadow` is the card drop-shadow (light mode only —
// dark mode separates layers by lightness, not shadows). `amber` completes the
// green/amber/red status ramp used by bills & budgets.
export const LT = {bg:"#f4f2ee",card:"#fff",cardH:"#f6f4f0",surf2:"#f1efe9",border:"#e7e4dd",txt:"#1a1a1c",txt2:"#6b7280",txt3:"#aeaeb2",inp:"#fff",inpB:"#d6d3cc",acc:"#007aff",green:"#34c759",amber:"#ff9f0a",red:"#ff3b30",cG:"#34c759",cR:"#ff3b30",recv:"#0d9488",shadow:"0 1px 2px rgba(28,25,18,.04),0 4px 16px rgba(28,25,18,.06)"};
export const DK = {bg:"#000",card:"#161618",cardH:"#232326",surf2:"#232326",border:"#2e2e32",txt:"#fff",txt2:"#8e8e93",txt3:"#55555a",inp:"#232326",inpB:"#3a3a3f",acc:"#0a84ff",green:"#30d158",amber:"#ffd60a",red:"#ff453a",cG:"#30d158",cR:"#ff453a",recv:"#2dd4bf",shadow:"none"};

// Currency & region presets — each sets number format (grouping/decimal) + currency symbol.
export const CURRENCIES = [
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

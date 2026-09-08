# MoneyTrack — File Map

Split into 3 babel files loaded in order by `index.html` (served over HTTP, no build step).
Shared values from `core.jsx` are on `window.*` so the other files see them.

## index.html (44 lines)
Head, CDN scripts (React/ReactDOM/Babel), `<style>` CSS (lines 13–35), `<div id="root">`,
then 3 ordered `<script type="text/babel" src="js/*.jsx">` tags.
**Edit CSS here.**

## js/core.jsx (~77 lines) — constants & utils
- `window.CATS` (3) — categories
- `window.DEFACCS` (16) — default accounts
- `window.LT` (23) / `window.DK` (24) — light/dark theme palettes
- `window.LS` (26) — localStorage helper (.g/.s)
- `window.fmt` (30) — EUR formatter · `window.uid` (31) · `window.tod` (32)
- `window.personalAmt` (34) — split-share math
- `window.haptic` (38) — vibration
- `window.I` (51) — icon set (SVG/emoji)
**Edit colors/theme, categories, icons, formatters here.**

## js/components.jsx (~130 lines) — reusable UI
MiniChart(2) · Sheet(39, bottom-sheet modal) · Label(56) · Toggle(57) ·
AnimatedNumber(64) · Ring(75, progress ring) · Confetti(87) · PinLock(96)
**Edit shared widgets here.**

## js/app.jsx (~1416 lines) — the App component + render
`function App()` at line 2. Line numbers below are within app.jsx.

### Handlers
showToast 57 · mkSet 84 · tgDk(dark toggle) 116 · closeM 251 ·
doAddTx 253 · doDeleteTx 270 · doEditTx 275 · openAddPrefill 276 ·
doAddAcc 283 · doEditAcc 293 · doAddCat 295 · doEditCat 306 ·
doAddGoal 308 · doEditGoal 320 · doAddRec 322 · doAddDebt 340 · doEditDebt 376 ·
doRepay 379 · settleAll 403 · recurring trigger 412 ·
doExport 434 · doImport 441 · exportCSV 454 · setBudget 461 · lockNow 462 ·
TABS 475 · SubNav 483

### Tab UI blocks (`{tab==="..."&&...}`) — V8.0 line numbers
home 541 · txs(Activity) 730 · splits(People) 791 · goals 939 ·
accs 980 · categories 1009 · stats(Analytics) 1031 · tx sheet 1180
(later sheets follow in same order as before; grep when needed)

### V8.0 design system (2026-06-11)
- Radii tokens: 20 cards / 12 inner / 99 pills (don't introduce new values)
- `.mt-label` = uppercase section caption (color via inline T.txt3)
- `.mt-tap` = pressable rows/cells · `.mt-stagger` on tab container = entrance
- `.mt-scaleback`+`.dimmed` on scroll container when modal open (iOS sheet feel)
- `goTxs(type)` (469) = navigate to Activity with type filter (fType state, 17)
- Tap-throughs: hero Income/Spent→goTxs, Net→stats spend, Safe/Budget→stats
  budget, Top Category→stats+drillCat, recent row→doEditTx, goals→goals tab
- No emoji in chrome (headers/banners use `I` icons); emoji OK in data/content

## Preview / Use
- Dev: `python3 -m http.server 8123` (launch.json name `moneytrack`), open
  http://127.0.0.1:8123/ . JSX errors white-screen silently — always verify.
- Double-click use: `./build.sh` combines the 3 files into standalone
  `moneytrack.html` (strips the duplicate hook-binding lines — duplicate
  `const` in one script is a SyntaxError). **Rebuild after every edit.**
- `index.html` opened via file:// shows a fallback note (it can't load js/
  cross-file under file://).
- localStorage is per-origin: file:// data ≠ http://127.0.0.1:8123 data.
  Move data between them with Settings → Export/Import.

## Versioning & deploy
- `VERSION` file holds the number (e.g. `7.3`); build.sh injects it as
  `window.MT_VERSION`; Settings sheet footer displays it; dev mode shows "dev".
- `CHANGELOG.md` — update it + bump VERSION before each deploy.
- `./deploy.sh "summary"` → builds, copies moneytrack.html → .deploy/index.html
  (clone of github.com/meet-p-dev/refactored-octo-tribble), commits "V<x> — summary",
  pushes. The repo file MUST be named index.html (user's iPhone home-screen URL).
- `.deploy/` is the git clone — don't edit files in it directly.

## Setters
`st/sr/sa/sc/sg/sb/sd` come from `mkSet` (app.jsx:84) which resolves functional
updaters before persisting — both concrete values and `(prev=>…)` are safe.

## Bug fixes 2026-06-11 (all verified in preview)
1. Timezone: `tod()` (core.jsx:32) now builds the date from LOCAL getFullYear/Month/Date;
   calMonth init, monthKey, recurring todayStr, and calendar curKey all derive from
   `tod()`. Only `exportedAt` still uses toISOString (intentional, it's a timestamp).
2. Undo after EDITING a tx now restores the old version (captured as `oldTx` in
   doAddTx) instead of deleting; also un-marks any splits settled in the same save.
3. Backup v2.4: doExport includes `budgets`, doImport restores them.

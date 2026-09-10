# MoneyTrack — project rules (read before any work)

MoneyTrack is a single-page personal-finance web app. EUR / de-DE, mobile-first,
premium iPhone-grade dark UI. Local-only — all state in `localStorage` under `mt-*` keys.
No accounts, no backend.

## Architecture (Next.js static export — migrated from buildless CDN)
- **Next.js 16 (App Router), React 19, plain JS/JSX (no TypeScript), static export**
  (`output:'export'` in `next.config.mjs`) — no server at runtime, deploys as static
  files to GitHub Pages same as before. Real build step now: `next dev`'s SWC compiler
  catches JSX/syntax errors at build time instead of silently white-screening.
- Source layout: `lib/` (constants.js, utils.js, icons.jsx — the old core.jsx, now ES
  modules), `components/` (shared widgets: Sheet, Toggle, AnimatedNumber, Ring,
  Confetti, PinLock, OnboardFlow, SubNav — the old components.jsx), `components/App.jsx`
  (state/derived-data/handlers core), `components/tabs/*` (7 tab views),
  `components/sheets/*` (9 modal sheets), `app/layout.js` + `app/page.js` (Next.js
  entry points, page.js just renders `<App/>`).
- Animations use **Motion** (`motion/react`) for `Sheet` (spring physics + drag-to-dismiss
  via the handle bar), `AnimatedNumber` (spring instead of hand-rolled easing), and tab
  switches (`AnimatePresence` fade/slide). Everything else — `.mt-tap`, `.mt-press`,
  Confetti, PinLock's shake — stays plain CSS in `app/globals.css` (ported verbatim from
  the old `<style>` block); no functional gain from converting those.
- **The pre-migration buildless version is preserved in `legacy-buildless/`** (index.html,
  js/core.jsx, js/components.jsx, js/app.jsx, old build.sh/deploy.sh) as a reference and
  rollback path. Do not edit it going forward — it's frozen history, not the active app.
- **Read `MAP.md` first** for the pre-migration file map (still useful for finding where
  a given piece of logic originated). The migration plan/rationale lives in
  `/Users/meet/.claude/plans/what-if-we-chaneg-majestic-cray.md` if you need the full
  reasoning behind a structural decision.

## The most important rule
Nothing is ever "done" until it has been verified to still **render in a real browser**
(not just "the edit applied" or "the build succeeded"). Always check `next dev`'s
terminal output AND the browser console after every change.

## Hard rules
- **Additive only.** Never remove or change an existing feature without the user's
  explicit OK. New work stacks on top.
- **Local dates only.** `tod()` (`lib/utils.js`) builds `yyyy-mm-dd` from LOCAL
  getFullYear/Month/Date. NEVER use UTC / `toISOString().slice(0,10)` for a calendar
  date — it shows up as off-by-one dates. (`exportedAt` timestamp is the only `toISOString` allowed.)
- **Persistence footgun is fixed** but stay aware: the `st/sr/sa/sc/sg/sb/sd` setters
  (`mkSet`, `components/App.jsx`) persist to localStorage; both concrete values and
  `(prev=>…)` updaters are safe. Every `mt-*` localStorage key name must stay
  byte-for-byte unchanged — there's no backend, only in-app JSON export/import as backup.
- **Currency singleton**: `lib/utils.js`'s `mtCur`/`mtSym`/`fmt`/`setCurrencyId` read a
  mutable, non-React module-level variable (not Context) so `fmt()` reflects currency
  changes immediately everywhere without prop-drilling. Don't "fix" this into Context —
  it's deliberate.
- **Design system (V11):** radii 20 (cards) / 12 (inner) / 99 (pills) — no new radius
  values. Theme tokens in `lib/constants.js` LT/DK now include `surf2` (2nd elevation),
  `amber` (status ramp green/amber/red), and `shadow` (card drop-shadow, light only —
  dark separates by lightness). `.mt-col` centers content at max 560px (header, tab
  content and tab bar all use it). `.mt-hero` fluid clamp() hero number, `.mt-num`
  tabular numerals. `.mt-label` uppercase captions, `.mt-tap` pressable rows,
  `.mt-scaleback`+`.dimmed` behind open sheets. Merchant rows use `Monogram`
  (components/Monogram.jsx — name-hash color + category badge). No emoji in chrome
  (use the `I` icon set from `lib/icons.jsx`); emoji fine in user data/content.
- **V11 navigation:** tab bar is Home · Activity · [+] · Insights(id "stats") ·
  Wallet(accounts/debts/goals via `walletView`). `navTab` in App.jsx remaps the legacy
  ids ("accs"/"splits"/"goals") into Wallet sections — always navigate through it.
  PWA: `public/manifest.json` + icons; keep basePath prefixes if you touch them.
- **Ask before any big rewrite.** Propose a plan and wait.

## Accounts & bank sync (the only non-local half)
- Bank sync signs in against Supabase project `vqvycbzrkeeuuhgrkpbf`, **shared with
  Heimat** (a separate repo, `~/Documents/Heimat`): one Postgres, one `auth.users`,
  one set of auth email templates. MoneyTrack owns the `mt_*` tables; Heimat owns
  `flats`/`flat_*`/`expenses`/`settlements`/`push_subscriptions`; `app_users` records
  which app an account belongs to. Never touch Heimat's tables from here.
- Sessions are namespaced (`mt-sb-auth`) because both apps live on the same
  GitHub Pages origin. Do not drop that storageKey — it is what keeps a Heimat
  sign-in from evicting a MoneyTrack one.
- Password reset lands on `app/reset/page.js` (`/refactored-octo-tribble/reset/`),
  not in the Bank Sync sheet. The full pipeline, the shared-project caveats and the
  one required dashboard setting are in `docs/password-reset.md` — read it before
  changing anything under `lib/bankSync.js`'s auth half.

## Verify & deploy
- Preview: `npm run dev` (or launch.json name `moneytrack-next`, port 3123), open
  http://localhost:3123/refactored-octo-tribble/ — note the **basePath prefix is
  required** in dev too, since `next.config.mjs` sets `basePath` for GitHub Pages'
  project-page subpath. Verify renders + check the console after every change. Before a
  real deploy, also sanity-check the actual static export (not just `next dev`) via
  `npx serve out` with `out/` nested under a `refactored-octo-tribble/` folder, since
  basePath asset resolution can differ between dev and export.
- **Two branches, two purposes.** `source` (this working tree) holds the code;
  `main` is the published GitHub Pages site and is written ONLY by ./deploy.sh,
  which runs `git rm -rq .` before copying `out/` in — so never commit source to
  `main`, it would be deleted by the next deploy. Excluded from the repo on
  purpose: `bank-sync/` (real transaction exports + the Enable Banking
  application id), `pre-redesign-backup/`, `MoneyTracker/` (the SwiftUI port has
  its own repo at ~/Documents/MoneyTracker-iOS), and the thesis files that share
  this folder.
- Build/deploy is the USER's call. `./build.sh` runs `npm ci && next build` into `out/`.
  `./deploy.sh "msg"` builds + syncs `out/` into the `.deploy/` GitHub Pages clone
  (clearing stale hashed chunks first, touching `.nojekyll` so GH Pages doesn't mangle
  the `_next/` folder) + commits + pushes; bump `VERSION` + `CHANGELOG.md` first.
  **Do NOT deploy unless asked.** Repo: github.com/meet-p-dev/refactored-octo-tribble,
  branch `main`. Current **V11.5**. (If git is blocked by Xcode: `sudo xcodebuild -license accept`.)

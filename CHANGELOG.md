# MoneyTrack Changelog

## V9.3 — 2026-07-14 · Currency picker + dark background fix
- **Currency & Region is now a single button** in Settings instead of a long list. It shows your current choice (flag, currency and an example like `1.234,56 €`); tapping it opens a picker with all 10 regions, and choosing one takes you straight back to Settings.
- **Fixed: white background showing through in dark mode.** The page background itself was never painted, so on iPhone the white default could show through around the app (safe areas, overscroll) — leaving dark cards floating on a light background. The background now always follows your theme, including before the app finishes loading, so there's no light flash on a cold start either.
- Nothing changed about your data, your currency choice, or any other feature.

## V9.2 — 2026-07-11 · Automatic bank sync
- **New: connect your bank.** Settings → *Connect a bank*. Sign in with your email (a 6-digit code — no password), link your bank once, and your transactions flow in automatically. No more manual file imports.
- Transactions refresh on their own **3× a day** (morning, afternoon, evening) and are auto-sorted into categories.
- Your bank data is private to your own account and synced securely; new transactions appear live.
- Fully additive — your existing manual transactions, accounts, goals, budgets and JSON backups are untouched. Bank login is optional; the app still works exactly as before without it.

## V9.1 — 2026-07-09 · Quicker + button
- The **+** button now lives only on the Home tab, in the bottom-right corner — out of the way of the other tabs, each of which already has its own Add button.
- Tapping it is instant now, especially on Android: it used to need a slightly longer press before it would open. It also has a smoother spring press/appearance.
- The + button is no longer draggable around the screen (it stays put bottom-right). Nothing else about adding a transaction has changed.

## V9.0 — 2026-07-07 · Rebuilt on Next.js
- Same app, new foundation: MoneyTrack now runs on Next.js instead of loading React straight from the browser at runtime. More reliable to build on going forward, and sets up for deeper animation work.
- Sheets (Add Transaction, Settings, and all the others) now use spring-physics animations and can be dragged down from the handle to dismiss, like native iOS sheets.
- Switching tabs now animates instead of snapping instantly.
- No changes to your data or any existing feature — this is a like-for-like rebuild, verified tab-by-tab and sheet-by-sheet before shipping.

## V8.6 — 2026-07-07 · Currency & region
- **New:** choose your currency and region in Settings → Currency & Region. Pick from Germany, France, Ireland, UK, USA, Canada, Australia, Switzerland, India or Japan.
- Your choice changes the currency symbol *and* how amounts are written everywhere in the app — e.g. German `1.000,00 €` vs US `$1,000.00`. Each option shows a live example.
- Backups now remember your currency (backup format v2.5); older backups still import fine.
- Default stays Germany / EUR — nothing changes until you pick.

## V8.5 — 2026-06-25 · First-run onboarding
- New first-time experience: welcome + quick guide → set up your accounts with their current balances → optionally connect your bank (import the bank-sync file) → you're in.
- After an app update, a short guide/intro shows again — your data is kept, nothing is re-asked.
- "Clear all data" now relaunches the full setup, so you can start completely fresh.


## V8.4 — 2026-06-24
- Activity: live summary line under the filter pills — "{N} transactions · {total} {verb}" that follows the active filter (Income → "in", Expenses → "spent", Transfers → "moved", All → expenses "spent"). Previously the total was always expenses-only, so Income/Transfers showed €0,00.
- Fix: People → Recurring header now reads "1 recurring transaction" (singular) instead of "1 recurring transactions".

## V8.1 — 2026-06-11 · iPhone bug-fix round (from your screen recordings)
- **Fixed:** Insights cards were cut off at the left screen edge — now aligned
  with everything else.
- **Fixed:** last items on every tab no longer hide behind the bottom panel —
  there's now proper scroll room above it.
- **Fixed:** the + button can no longer be dragged over the bottom panel or the
  top header — it stays between them and glides to the left or right edge.
- **Fixed:** tall sheets (like Settings) no longer slide under the iPhone
  status bar/clock.
- **Fixed:** switching tabs/views showed a blank screen before content "popped
  in" — entrance animation is now ~4× faster and barely blocks anything.
- **Improved:** "Projected spend" now uses your *typical* daily pace (median),
  so one big one-off expense no longer explodes the forecast into nonsense.

## V8.0 — 2026-06-11 · The big UI polish
- **New look, same features:** balance is now a large floating number (the
  hero of the Home screen), header slimmed to quiet icons, Safe-per-day and
  Budget-left merged into one compact card, insights became compact chips,
  bold section titles replaced by small uppercase labels. Same colors, ~25%
  more content per screen.
- **Everything is tappable and leads somewhere logical:** Income/Spent →
  Activity filtered to income/expenses (new filter pills there too) · Net →
  Analytics · Safe-per-day & Budget → budget view · any Top Category → that
  category's merchant breakdown · any recent transaction → opens it ·
  goals preview → Goals.
- **Smoother:** cards animate in one after another, the screen scales back
  behind bottom sheets (iOS style), consistent press feedback everywhere.
- **More consistent:** one spacing grid, two corner radii (was nine), no
  more emoji in the app chrome — proper icons instead.

## V7.3 — 2026-06-11
- **Fixed:** recurring transactions could be added *twice* and get yesterday's
  date when the app was opened between midnight and ~2:00 (timezone bug). All
  dates now use local time consistently.
- **Fixed:** tapping *Undo* right after **editing** a transaction deleted it
  instead of restoring the previous version. Undo now restores it (and also
  un-marks splits settled by the same save).
- **Fixed:** backups now include your category budgets (backup format v2.4);
  importing restores them. Older backups still import fine.
- **New:** app version shown at the bottom of Settings.
- Internal: code reorganized for faster development (no visible change).

## V7.2 — earlier
- Baseline (previous single-file release).

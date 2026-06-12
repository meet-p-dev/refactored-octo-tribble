# MoneyTrack Changelog

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

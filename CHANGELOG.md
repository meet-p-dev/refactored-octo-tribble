# MoneyTrack Changelog

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

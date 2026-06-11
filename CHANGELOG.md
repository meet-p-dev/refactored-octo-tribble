# MoneyTrack Changelog

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

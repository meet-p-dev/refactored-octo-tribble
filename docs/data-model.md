# Data model (web + iOS)

Where MoneyTrack keeps data, in both apps. If you change a key, a field or a table, update
this file, and remember that the other app has to read the same thing.

## Web app: `localStorage` (`mt-*` keys, names must never change)

| Kind | Keys |
|------|------|
| Data | `mt-accs`, `mt-txs`, `mt-cats`, `mt-goals`, `mt-debts`, `mt-budgets`, `mt-recurring` (legacy), `mt-currency` |
| Learning (synced to `mt_user_prefs`) | `mt-tx-decisions`, `mt-payee-stats`, `mt-share-overrides`, `mt-owner-name` (`mt-payee-rules` = old v1, auto-migrated) |
| Settings & UI state | `mt-dark`, `mt-pin`, `mt-notif-enabled`, `mt-onboarded`, `mt-last-account`, `mt-last-category`, `mt-dismissed-notifs`, `mt-debt-banner`, `mt-cat-migrated`, `mt-cat-migrated-received`, `mt-tx-live` |
| Sign-in & bank connect | `mt-sb-auth` (Supabase session, namespaced away from Heimat's), `mt-bank-auth-start`, `mt-bank-connect` |

## Backup file (JSON, `version: "2.6"`)

```
{ accs, cats, txs, goals, recurring, debts, budgets, currency,
  payeeStats, txDecisions, shareOverrides, ownerName, exportedAt, version }
```

Both apps write and read this format. The web side is `doExport`/`doImport` in
`components/App.jsx`, and the iOS side is `Core/BackupCodec.swift` + `BackupService.swift`.
Restore **replaces** sections, it doesn't merge.

Account fields worth knowing:
- `ib`: the starting balance
- `ibDate`: the starting-balance date (V11.8)
- credit cards: `kind: "credit"` with `creditLimit`, `statementDay`, `dueDay`, `apr`,
  `payFromId`, `autopay`, `billPayee`
- bank-synced accounts: `_bank`, or an id starting with `sb-`

Transaction types: `expense`, `income`, `transfer` from the user or the bank. The
classifier's effective overlay adds `credit` (money in that isn't income, "Received") and
`debit` (money out that isn't spending, "Sent out").

## iOS app
- **SwiftData** models in `Models.swift`: Account, TxCategory, Txn, Goal, Debt, Budget,
  plus RecurringTxn (legacy, kept only to read old data).
- **Learning:** `LearningStore` → `Application Support/learning.json` (same four stores as the web).
- **Sign-in session:** Keychain (`CloudSync.swift`).
- **Flags (UserDefaults):** `mt-ios-migrated-v11.8`, `mt-ios-tour-seen`,
  `mt-ios-checklist-hidden`, `mt-debt-banner-seen`, `mt-reset-tips`, `appLockEnabled`.

## Cloud: Supabase `vqvycbzrkeeuuhgrkpbf` (EU, Ireland, shared with Heimat)

MoneyTrack's tables (per-user row-level security, anonymous logins rejected):

| Table | Holds |
|-------|-------|
| `mt_bank_connections` | bank name, country, Enable Banking session id, account uids, `valid_until`, status, `last_synced_at`, `last_sync_error`, `sync_from` |
| `mt_accounts` | bank accounts: name, color, `initial_balance`, `bank_connection_id`, `bank_account_uid` |
| `mt_transactions` | bank transactions: `external_id` (`eb-` + entry reference), type, amount, merchant, category, notes, account, date |
| `mt_user_prefs` | `payee_stats`, `tx_decisions`, `share_overrides`, `owner_name` |
| `app_users` | one row per user per app (`app = 'moneytrack'` for us), `last_seen_at` |

Only bank data and learning go to the cloud. Hand-entered accounts and transactions stay on
the device. The web app only reads `mt_transactions`. Rows are written by the edge
function `mt-bank-sync` (cron 07/12/18 UTC). Never read or write Heimat's tables (`flats`,
`flat_*`, `expenses`, `settlements`, `push_subscriptions`).

**If data handling changes, update `public/legal/privacy.html` too.**

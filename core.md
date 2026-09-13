# MoneyTrack — core

**Read this first in every new chat**, then `update.md` (what happened recently) and
`todo.md` (what's left). App-specific rules: `CLAUDE.md` in each repo.

## The product

MoneyTrack is a personal finance app for one person's own money: balances, spending,
budgets, credit-card bills, debts and savings goals. EUR / de-DE by default, built for
iPhone. It never moves money. Bank access is read-only.

It exists as **two apps of one product**:

|              | Web app                                             | iOS app                                            |
|--------------|-----------------------------------------------------|----------------------------------------------------|
| Folder       | `~/Documents/Moneytracker` (this repo)              | `~/Documents/MoneyTracker-iOS`                     |
| GitHub       | `meet-p-dev/refactored-octo-tribble` (public). `source` = code, `main` = live site (written only by `./deploy.sh`) | `meet-p-dev/MoneyTracker-iOS` (private), `main` |
| Stack        | Next.js 16 static export, React 19, plain JS/JSX    | SwiftUI + SwiftData, iOS 26 (Liquid Glass), Swift Charts, TipKit |
| Runs at      | https://meet-p-dev.github.io/refactored-octo-tribble/ (home-screen web app) | Installed on the user's iPhone 17 Pro from Xcode |
| Version      | `VERSION` file (V11.8)                               | Settings shows "11.8 (native)" = feature parity with web V11.8 |
| Rules        | `CLAUDE.md` in this repo                             | `CLAUDE.md` in the iOS repo                        |

### Purpose of the web app
The original MoneyTrack and the **reference for all the maths**: balances, the bank
classifier, card cycles, stats. It runs anywhere (phone home screen, desktop) with no
install, and it's where bank sync was built first.

### Purpose of the iOS app
A native iPhone version of the same app: the same data format, the **same numbers** and the
same features as the web app. It adds Apple's look and feel, plus a layer that helps new
users (welcome tour, Get started checklist, "How MoneyTrack works", ⓘ explanations). When
the two disagree on a number, the web app is right and the iOS port gets fixed.

## How the two apps connect

- **Same account.** Bank sync signs in with the same email/password on both (Supabase).
  Bank accounts, bank transactions and the "learning" (classifier decisions, payee stats,
  My share, owner name) sync through the cloud, so both apps show the same bank data.
- **Hand-entered data does not sync.** It moves with a JSON backup (format 2.6), which
  works both ways (web → iOS and iOS → web). The user chose "import once for now".
- **Ported code must stay in step.** `lib/classify.js` ↔ `Core/Classifier.swift`,
  `lib/credit.js` ↔ `Core/CardMath.swift`, `lib/merchants.js` ↔ `Core/Merchants.swift`,
  the App.jsx balance/stats logic ↔ `Core/Ledger.swift` + `Core/Insights.swift`. Change one,
  change the other, and re-check both against a real backup.
- **Backend:** Supabase project `vqvycbzrkeeuuhgrkpbf` (EU, Ireland), **shared with Heimat**.
  MoneyTrack only touches `mt_*` tables and `app_users` rows with `app='moneytrack'`. Edge
  functions `mt-bank-auth-start`, `mt-bank-connect` and `mt-bank-sync` (cron 07/12/18 UTC)
  talk to Enable Banking. Details in `docs/data-model.md` and `docs/password-reset.md`.
- **Legal:** `public/legal/privacy.html` and `public/legal/terms.html` in this repo cover
  **both** apps. The web Settings and the iOS Settings link to them. Heimat has its own
  pages in its own repo, and the two are never shared.

## Hard rules (both apps)

1. **The balance equals the real bank.** The bank owns the direction, amount and date of
   every synced row. A user edit only changes its meaning (type, category, merchant, notes).
2. **A bank credit is not income.** The classifier decides income / received / sent out.
   Never go back to "every credit is income".
3. **"My share" is manual.** Never re-add automatic rent netting.
4. **Starting-balance date (`ibDate`)** on hand-managed accounts: rows before it stay in
   history but don't move the balance. Bank accounts never get one.
5. **Card bills are transfers into the card.** They're detected automatically
   (`looksLikeCardBill`), and the user's own choice always wins. Pay Bill must not log a
   second payment when the pay-from account syncs from a bank.
6. **Local dates only.** Use `yyyy-mm-dd` from the local calendar, never UTC.
7. **Additive only.** Don't remove a feature without the user's OK. Removals the user
   approved: Recurring and WG splits (→ My share) on iOS, and balance-over-time charts on
   iOS.
8. **Never touch Heimat** (its tables, repo or folder) from MoneyTrack work.
9. **Never commit real financial data**: backups, bank exports, screenshots with real
   numbers, credentials. `bank-sync/` is git-ignored. Delete scratch copies after use.
10. **Nothing is done until it's verified**: in a real browser for the web app, in the
    simulator for iOS. Check the numbers, not just that it builds.
11. **Commit, push and deploy only when the user asks.** A web deploy means
    `./deploy.sh`, after bumping `VERSION` and `CHANGELOG.md`.
12. **It must not look AI-made.** Keep copy short and plain, with no em-dash sentences in
    the UI. No sparkles, glows or tip overload.
13. **Privacy:** the merchant list only ever contains organisations, never personal names.
    The user's password is never typed by an assistant, so the user signs in themselves.

## The user

Non-developer owner who wants a polished, iPhone-grade app and doesn't want to manage
files or git. Explain changes simply and briefly. Ask before big rewrites.

## Map of this folder

| Path | What |
|------|------|
| `core.md` / `update.md` / `todo.md` | This file / recent work log / open items and ideas (both apps) |
| `CLAUDE.md` | Web app rules, architecture, deploy |
| `AGENTS.md` | Pointer for other coding agents |
| `CHANGELOG.md`, `VERSION` | Web release notes and version |
| `docs/data-model.md` | Storage keys, backup format, Supabase tables (both apps) |
| `docs/password-reset.md` | Shared-auth setup with Heimat, reset flow |
| `docs/legacy-map.md` | History: file map of the pre-Next.js version |
| `app/`, `components/`, `lib/`, `public/` | Web app source (`public/legal/` = legal pages) |
| `supabase/functions/` | Bank-sync edge function source |
| `legacy-buildless/` | Frozen pre-migration web app (rollback path, don't edit) |
| `bank-sync/` | Local only, git-ignored: real bank exports and credentials |
| `.deploy/` | Local only: GitHub Pages checkout used by `deploy.sh` |

Other projects on this Mac (keep separate): **Heimat** (`~/Documents/Heimat`, its own repo
and legal pages), and the thesis (`~/Documents/Masters/Thesis`). Old MoneyTrack copies are
in `~/Documents/MoneyTrack Archive/`.

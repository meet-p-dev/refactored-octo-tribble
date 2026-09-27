# MoneyTrack — update log

Newest first. Add an entry at the top after every working session, with separate **Web**
and **iOS** parts, so the next chat knows where things stand.

---

## Where things stand (27 Sep 2026)

- **Web:** V11.10 is live, with the Apple Pay paragraph in the privacy policy.
- **iOS:** TestFlight build 1.0 (3) is uploaded (Tap & Settle + statement import, `ee0d866`).
  Build 2 failed processing: App Intent text may not contain "Apple" (error 90626), so the
  action is now "Log a Wallet payment".
- **Next:** the user tests real taps per card (Settings → Apple Pay payments → "What Wallet
  sent"), sends the three Phase 0 emails, then Phase 2 (statement import). The full plan is
  in the iOS session notes ("Tap & Settle").

---

## 27 Sep 2026 (night): weekly reminder, Phase 6 bank notifications

### iOS app
- **Statement reminder is weekly** (Sundays 18:00); export steps say "last 30 days" (overlaps
  are fine, nothing is added twice). An existing monthly reminder is replaced on next launch.
- **Bank notifications (Phase 6, iOS 27):** new action "Log a bank notification" for the Shortcuts
  Notification automation. `Core/NoteParser.swift` reads amount, currency, direction and payee
  from the text; money in never counts as income by itself ("Received"). Payments go through
  the same Tap & Settle engine (the matcher now knows money in vs out). A Wallet tap and the
  bank's notification for the same purchase are folded into one.
- **Verified:** 14 parser cases (Sparkasse Karten-/Umsatz-/Gehaltswecker, Revolut, Wallet,
  Privatmodus, balance and code messages); simulator: a Revolut notification → link app →
  pending; a same-amount REWE tap stays separate; a Lidl tap folds into the Lidl notification.
  Replay still 19/19. Test data removed.
- **Still to confirm on the iPhone (iOS 27):** does the Notification automation run without
  asking, and what do Sparkasse/Revolut notifications really say? The log in Settings →
  Bank notifications shows it.

---

## 27 Sep 2026 (evening): Statement Drop, Phase 2 finished

### iOS app
- **More formats:** Excel (.xlsx, own small ZIP reader) and PDF statements (PDFKit text; a line
  that starts with a date and ends with an amount; on a card statement a plain amount is a
  charge and "-" is a payment). Tested on made-up Revolut Excel and Advanzia-style PDF files.
  **Needs a real Advanzia PDF to tune.**
- **Open in MoneyTrack:** banking apps and Files can share CSV, Excel, PDF, camt and MT940 to the
  app (document types in `Config/MoneyTracker-Info.plist`). Verified: Files → Share → MoneyTrack
  opens the import.
- **Your banks** (Settings, and a new "Choose your banks" step on Home): pick your banks, see
  how each gets in (Apple Pay every day, the statement once a month) with the export steps,
  optional monthly reminder (local notification, 3rd at 18:00).
- **Balance check that stays:** each import saves the statement's closing balance; Home says
  "X differs from its statement" if the account drifts, with a confirmed one-tap fix.
- Simulator: PDF import into a test card (5 added), difference shown, Home alert, fix; share
  sheet; banks screen. All test data removed; simulator back to 175,11 €.
- Noted: adding a second credit card makes Sparkasse bill payments stop auto-matching to
  Advanzia unless each card has its "bill payee" set (existing web logic, unchanged).

---

## 27 Sep 2026 (later): Statement Drop, Phase 2 (first part)

### iOS app
- **Build 1.0 (2) failed processing** (90626: the intent was called "Log Apple Pay payment").
  Renamed to "Log a Wallet payment" and uploaded as **build 1.0 (3)**, which also has the import.
- **Import a bank statement** (Settings): CSV from Revolut, Sparkasse, DKB, ING, N26 and any bank
  with a date and an amount column (Latin-1 or UTF-8, `;` `,` or tab), camt.052/053 and MT940.
  - Hand-managed account: file rows come in as bank rows. Apple Pay taps and rows you typed are
    confirmed in place (the bank's amount and date win), transfers you already have (a card bill
    paid from Sparkasse) are linked, pending and reversed rows are skipped, the Revolut fee is
    its own row. Importing the same file again adds nothing (fingerprints with occurrence count).
  - Bank-synced account: cross-check only ("In your file, not in your bank sync"), nothing added.
  - After import: the balance on the statement's last day is checked against its closing
    balance, with a one-tap "change the starting balance to match".
- **Verified:** swiftc tests on made-up files in each format; simulator: cross-check on the
  synced Revolut account, import into a test account (5 added, balance matches 107,87 €),
  re-import (5 already imported). Test data removed afterwards.
- **Not done yet:** Advanzia PDF and Excel files (need real samples), "Open in MoneyTrack" from
  other apps, the monthly reminder and the "Which banks do you use?" planner.
- **Heads-up:** at 09:33 the stale June copy (`~/Documents/MoneyTrack Archive/ios-xcode-copy-stale-2026-06`)
  was built into the iPhone 17 Pro simulator and rewrote its database with the old schema.
  The simulator was restored from the 13 Sep backup. Don't build that copy.

---

## 27 Sep 2026

### iOS app: Tap & Settle, Phase 1
- **What it does:** a Shortcuts Wallet automation calls the new App Intent "Log Apple Pay
  payment" (background, no dialog) after each in-store Apple Pay tap.
  - On a bank-synced account the tap waits as "pending" next to the balance, never inside it.
    When the bank books the purchase, the matcher (`Core/Fusion.swift`, iOS only) pairs them
    and the bank's row wins.
  - On a hand-managed account (Advanzia, cash) the tap becomes a normal expense at once.
  - Unsure pairs ask "Same purchase?" once; a tap the bank never books (feed complete past it)
    becomes "not booked" (not charged / pick the bank row / paid another way).
- **Matching:** gates (account, direction, date window, amount with tip/hold/FX bands), a
  log-odds score (name, amount, the till time German banks put in card rows, card words, lag),
  one-to-one assignment, learning of aliases, booking lag, tips and FX. Local only.
- **Verified:**
  - swiftc replay of the July Sparkasse export: 19/19 card rows settle, 0 false merges, a
    declined tap becomes an orphan, a same-amount transfer is never merged; also with taps
    delivered 3.5 h late.
  - Simulator: link card, "Same purchase?" → matched, pending line, hand-managed expense,
    duplicate tap ignored, Remove. Numbers unchanged afterwards (175,11 € etc.).
- **Phase 0:** the developer account is an individual account. Email drafts for the FinTS
  registration, Enable Banking and the International Office are with the user.

### Web app
- **V11.10:** `public/legal/privacy.html` gets an Apple Pay paragraph (on-device only). Deployed.

---

## 24 Sep 2026

### Web app
- **V11.9:** deployed the legal pages from `6b03d27`. They had been committed but never
  deployed, so `legal/privacy.html` and `terms.html` returned 404. That broke the
  Settings → Legal links in both apps, and TestFlight needs a live privacy policy URL.
  Checked in a local copy of the static export first: the app loads with no console
  errors and both links return 200.

### iOS app
- **Getting ready for TestFlight:**
  - Added an app icon. There wasn't one, and uploads get rejected without it. It's the
    web's maskable icon redrawn at 1024px.
  - Set `ITSAppUsesNonExemptEncryption = NO`. The app only uses HTTPS and Keychain, so
    each build skips the export-compliance question.
  - Set the Finance category.
  - The Release archive (1.0, build 1) built and signed.
- **Upload blocked:** `xcodebuild -exportArchive` (`destination: upload`, the Xcode
  account, same as Heimat) failed with `missingApp(bundleId: "com.patel.MoneyTracker")`.
  The user has to create the app in App Store Connect first. Every later upload needs a
  higher `CURRENT_PROJECT_VERSION`.

---

## 13 Sep 2026

### Web app
- **V11.7:** paying a card bill from the bank reaches the card again. The €42 protection from
  V11.3 had also thrown away transfer destinations. Card bills are now recognised
  automatically ("Kreditkartenabrechnung", "Mastercard Abrechnung", issuer names such as
  Advanzia), and the user's choice wins.
- **V11.8:** starting-balance dates (`ibDate`) for hand-managed accounts, which fixes old
  entries being counted twice. The investigation: the Advanzia card showed a different
  amount than the card app because bank-synced bill payments from before the typed-in
  balance were subtracted again. Also added a one-tap Fix alert on Home, and Pay Bill and
  auto-pay guards when the pay-from account is bank-synced. Deployed; commit `91bfa84`.
- **Legal:** MoneyTrack now has its own `public/legal/privacy.html` and `terms.html`,
  covering the web and iOS apps (EU data in Supabase Ireland, Enable Banking, no
  tracking). There's a Settings → Legal section with links. Heimat's legal pages stay in
  the Heimat repo.
- **Organised:** added `core.md`, `update.md`, `todo.md`, `docs/data-model.md` and
  `README.md`. `MAP.md` moved to `docs/legacy-map.md` (it was out of date). `AGENTS.md`
  now points to the real rules.
  - Thesis files moved to `~/Documents/Masters/Thesis/From Moneytracker folder/`.
  - The stale iOS Xcode copy and `pre-redesign-backup/` moved to
    `~/Documents/MoneyTrack Archive/`.

### iOS app (`~/Documents/MoneyTracker-iOS`)
The goal was to copy all web V11.8 features into the native app, in 4 phases the user
approved.

User decisions:
- Bank sync uses the same account as the web app.
- Hand-entered data comes over once through a backup (it doesn't sync).
- Match the web app: Recurring removed, and WG splits became "My share".

| Commit | What |
|--------|------|
| `253a82a` | **Phase 1, data and maths.** Ported the web logic to plain Swift in `Core/` (Ledger, CardMath, Classifier, Merchants, JSRegex, BackupCodec). Backup 2.6 import/export, and migrating old installs. |
| `13a3370` | **Phase 2, bank sync.** Supabase sign-in (the same account), sync with self-healing, classifier and review inbox, learning synced through `mt_user_prefs`. |
| `ad2b426` | **Phase 3, new look.** The web layout (Home · Activity · + · Insights · Wallet) with iOS 26 Liquid Glass, web colour tokens and merchant monograms. |
| `a261014` | **Phase 4, easier to use.** Own glass tab bar with a bigger +. Balance-over-time charts removed (user's request). Every Insights number, slice, bar and calendar day opens its transactions. Welcome tour, Get started checklist, "How MoneyTrack works", ⓘ explanations, tips. |
| `0b5d613` | Small "MoneyTrack" title top-left and profile button top-right. The Profile screen has name, email, data counts, Bank sync and Settings. Copy rewritten plain ("must not look AI-made"), and only 2 tips kept. |
| (next) | Settings → Legal links to the privacy policy and terms. `CLAUDE.md` and `docs/architecture.md` added. |

- **Verified** against the user's real backup and the cloud:
  - total 175,11 €, cash 1.241,82 €, Advanzia owed 1.066,71 €
  - September: 61,32 € in, 422,91 € spent
  - classifier identical to the web on 127 rows
  - Sparkasse 139 rows at 1.157,92 €, Revolut 19 rows at 83,90 €
- **Installed on the iPhone** with `xcodebuild` and `devicectl` (see the iOS `CLAUDE.md`).
- **GitHub:** created the private repo `meet-p-dev/MoneyTracker-iOS` and pushed `main`.

### Left alone on purpose
- **Heimat** (`~/Documents/Heimat`) has uncommitted work from two other open sessions, so it
  wasn't touched. Its root folder has old untracked `privacy.html`/`terms.html` copies from
  June that differ from the real ones in `public/legal/`. They're for the Heimat sessions
  to clean up.

---

## Earlier (web, from CHANGELOG.md)
- **V11.6 (11 Sep):** clear message when a reset email can't be sent.
- **V11.5 (11 Sep):** reset links survive mail-app previews.
- **V11.4 (8 Sep):** own password-reset page.
- **V11.3 (6 Sep):**
  - Fixed the €42 balance drift (an edit could flip a bank row's direction).
  - Every sync re-checks bank rows.
  - Added a "Sent out" option.
  - No pre-added accounts on a fresh install.
- **V11.2 and earlier:** see `CHANGELOG.md`.

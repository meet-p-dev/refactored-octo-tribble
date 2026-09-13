# MoneyTrack — update log

Newest first. Add an entry at the top after every working session, with separate **Web**
and **iOS** parts, so the next chat knows where things stand.

---

## Where things stand (13 Sep 2026)

- **Web:** V11.8 is live and `source` is pushed. The new legal pages and Settings → Legal
  links are committed but **not deployed yet**.
- **iOS:** Phases 1–4 of copying the web app's features are finished, plus the profile
  change. It's installed on the user's iPhone. The repo is on GitHub (private).
- **Next:** see `todo.md`.

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

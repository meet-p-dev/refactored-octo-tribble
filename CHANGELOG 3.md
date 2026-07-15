# MoneyTrack Changelog

## V9.6 — 2026-07-15 · Evidence engine, your real rent share, symbols
- **The classifier is now an evidence engine, not a rule list.** Every incoming payment is scored across all its possible meanings — salary, reimbursement, refund, own transfer, loan — by combining independent signals: wording, who sent it, amount patterns, whether it mirrors an earlier payment, and what you've confirmed about that person before. It only decides on its own when the odds are decisive; anything genuinely ambiguous is held for a one-tap review, with the reason and a confidence percentage shown ("large amount from a person — could be a loan · 46% sure").
- **It handles the same person meaning different things** — a flatmate can send rent one month and a Splitwise settlement the next; the wording and amounts decide each one individually, and your taps teach it person by person.
- **Refund pairing:** a credit that matches an earlier payment (same shop, or same amount via a payment processor like Adyen/PayPal) is recognised as a refund automatically.
- **Own-transfer pairing:** money that leaves one of your accounts and lands in another (same amount, same days) is recognised as your own transfer — on top of matching your name.
- **Your REAL rent share.** When you collect rent from flatmates and pay the landlord in full, the app now nets it: the landlord payment shows as *your share* (what you paid minus what you collected) in every total, with "your share · full €X" on the row. If a flatmate nets a Splitwise debt out of their rent transfer, the shortfall automatically lands in your share — which is exactly what that month really cost you.
- **New review option: Loan / payback** — for borrowed money or a loan being repaid to you.
- **Symbols everywhere.** All app emojis replaced with a crisp SVG symbol set (categories, insights, notifications, empty states, onboarding). Emojis remain only where they're YOUR content: custom category icons and goal icons.
- Onboarding text updated (Debts instead of the removed splits/recurring).
- Fully additive: balances still match your bank exactly; nothing about your data changed.

## V9.5 — 2026-07-15 · Smarter income + Received money
- **Money you receive is no longer always counted as income.** Until now every credit into your bank was treated as income. A friend paying you back, a refund, rent you collect from flatmates, or a transfer between your own accounts would all inflate your income. Now the app works out what each incoming payment actually is.
- **New "Received" class of money** — reimbursements, refunds and transfers show as their own thing (in teal), separate from real income (green). It still lands in your **balance** (the money really arrived), it just doesn't count as **income**.
- **New categories:** 🔁 Reimbursement and ↩️ Refund. Plus a **Received filter** in Activity so you can see everything that came in that isn't income, with a running total.
- **Review inbox** — when the bank sends money the app isn't sure about, a banner on Home lets you tap what it is (Income / Reimbursement / My transfer / Refund). It **remembers your choice per person**, so the same friend is sorted automatically next time.
- **You can now set a transaction as "Received"** yourself, and pick Reimbursement or Refund as its category.
- **Notifications** — turn them on in Settings and get a pop-up when your bank syncs new transactions.
- **Removed, now that bank sync does the work:** manual *Recurring transactions* (your bank already imports the real ones, so keeping both double-counted) and *Splits*. The People tab is now **Debts** — debt tracking is unchanged.
- Removed the Haptic-feedback setting (it wasn't working reliably).
- Fully additive to your data: existing transactions, accounts, budgets, goals and backups are untouched; your balances still match your bank exactly.

## V9.4 — 2026-07-14 · Credit cards
- **New: credit cards.** Accounts → Add → *Credit Card*. Give it a credit limit, the day your statement closes and the day the bill is due (plus an optional APR), and spend on it like any other account.
- Your card shows **three numbers that usually get confused**: *Statement* (what the closed bill wants on the due date), *Unbilled* (what you've charged since — it rolls onto the next bill) and *Available* (limit minus everything you owe).
- **Utilisation ring** — green while you're under 30% of your limit, amber above, red near the top. It also warns you if you go over the limit.
- **Pay Bill** logs the payment for you: one tap fills in a transfer from your bank account for the exact statement amount. Turn on **Auto-pay** and it happens by itself on the due date.
- **A bill-due banner on Home** from 7 days out, plus notifications when a bill is due or overdue.
- **Analytics → Spending now shows Cash vs credit** for the month: how much of your spending was money you had versus money you still owe.
- Also on the card: this cycle's spending pace and where the next bill is heading, an estimate of the interest you'd pay if you don't clear the bill, a 12-bill history chart, and a breakdown of what you put on the card.
- **Total Balance is now true net worth** — your cash minus what you owe on your cards — with a `cash − credit` line underneath so you can always see both halves.
- Paying a card bill is **never counted as new spending** (the spending was already counted when you paid with the card), so your monthly totals stay honest.
- Fully additive: every existing account, transaction, budget, goal and backup works exactly as before.

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

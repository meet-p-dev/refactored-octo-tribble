# MoneyTrack (web app)

A personal finance app for your own money: balances, spending, budgets, credit-card bills,
debts and savings goals. It can import transactions from your bank (read-only, via Enable
Banking) three times a day.

**Live:** https://meet-p-dev.github.io/refactored-octo-tribble/ · **iPhone version:**
separate repo, `meet-p-dev/MoneyTracker-iOS` (private).

## Branches
- `source`: the code (this branch)
- `main`: the published site, written only by `./deploy.sh`

## Run it
```
npm install
npm run dev   # http://localhost:3123/refactored-octo-tribble/
```

## Docs
- [`core.md`](core.md): what MoneyTrack is (web + iOS) and the hard rules
- [`update.md`](update.md): recent work
- [`todo.md`](todo.md): open items and ideas
- [`CLAUDE.md`](CLAUDE.md): web architecture, rules, deploy
- [`docs/data-model.md`](docs/data-model.md): storage, backup format, cloud tables
- [`CHANGELOG.md`](CHANGELOG.md): release notes

## Legal
[Privacy policy](public/legal/privacy.html) · [Terms of use](public/legal/terms.html).
These cover the web and iPhone apps.

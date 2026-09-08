# Password reset, and the line between MoneyTrack and Heimat

MoneyTrack shares one Supabase project (`vqvycbzrkeeuuhgrkpbf`) with Heimat, the
author's flat-money app for international students: one Postgres, one
`auth.users`, one set of auth email templates. Deliberate — one database, one
bill, one place to look. It also means both apps have to be explicit about a few
things a single-app project gets for free.

Note the scope: this is about the **bank-sync half only**. Everything else in
MoneyTrack is still local-only `mt-*` localStorage with no account behind it.

## What is shared and what is not

| | Shared | Separate |
|---|---|---|
| Postgres | ✔ one database | MoneyTrack owns the `mt_*` tables; Heimat owns `flats`, `flat_*`, `expenses`, `settlements`, `push_subscriptions` |
| Accounts | ✔ one `auth.users` — one email and password unlocks both | membership and per-app profile live in `app_users` |
| Sessions | — | MoneyTrack stores under `mt-sb-auth`, Heimat under `heimat-auth`, so signing into one never signs you out of the other even on the shared `meet-p-dev.github.io` origin |
| Reset page | — | each app has its own: MoneyTrack's `/reset/`, Heimat's `reset.html` |
| Auth emails | ✔ one template per email type | the link inside carries whichever app sent it |

The password itself is genuinely shared: one `auth.users` row per person, so
resetting from MoneyTrack changes the password Heimat asks for too. Splitting
that would take a second Supabase project purely for auth.

## `app_users`

```
app_users(user_id, app, display_name, prefs, created_at, last_seen_at)
  primary key (user_id, app)     app in ('heimat', 'moneytrack')
```

One row per (account, app), RLS-scoped to `auth.uid() = user_id`. `lib/appUser.js`
writes MoneyTrack's row whenever a sign-in, a first sign-up or a completed reset
proves the account is one of ours. Writes fail soft — membership is bookkeeping
and must never cost anyone a sign-in.

## The reset pipeline

1. **Ask.** "Forgot password?" in the Bank Sync sheet calls
   `sendPasswordReset(email)` (`lib/bankSync.js`), which uses
   `resetUrl()` → `<origin>/refactored-octo-tribble/reset/`, or
   `NEXT_PUBLIC_MT_RESET_URL` when that is set.
2. **Email.** Supabase sends its recovery template. The link goes through
   `/auth/v1/verify` and bounces to the `redirectTo` — which is why that URL has
   to be allow-listed (below), or Supabase silently falls back to the project's
   Site URL and the user lands in Heimat.
3. **Land.** `app/reset/page.js` — a route of its own, exported statically to
   `out/reset/index.html`. It reads the recovery token out of the fragment before
   the Supabase client wipes it (the client is lazy, so module scope still sees
   the address the email sent), turns it into a session, and asks for the new
   password.
4. **Finish.** `updateUser({ password })`, then the account is recorded in
   `app_users`, then a link back into the app. The browser is left signed in.

The old in-sheet `PASSWORD_RECOVERY` handler in `components/App.jsx` stays put as
a fallback for links sent before the page existed.

### The gate that matters

The page only shows the password form when it was actually reached by a link —
`type=recovery` or an `access_token` in the fragment, or a `?code=` to exchange.
Without that check it would hand a "choose a new password" box to anyone who
merely opened the URL while a session sat in the browser.

Three failure paths, all landing on "send me a fresh link": `otp_expired`, a
token that no longer resolves to a session, and no link at all. The "we sent it"
message is worded identically whether or not the address has an account, so the
page can't be used to find out who has one.

## Supabase dashboard — required once

**Authentication → URL Configuration → Redirect URLs** must contain all four:

```
https://meet-p-dev.github.io/refactored-octo-tribble/reset/
https://meet-p-dev.github.io/refactored-octo-tribble/**
https://meet-p-dev.github.io/Heimat/reset.html
https://meet-p-dev.github.io/Heimat/**
```

Add `http://localhost:3123/refactored-octo-tribble/reset/` for local testing.

Also worth turning on: **Authentication → Policies → Leaked password
protection**. Off today.

## Moving to a separate domain

Set `NEXT_PUBLIC_MT_RESET_URL=https://moneytrack.example/reset/` (and
`VITE_RESET_URL` on Heimat's side), and add the new addresses to the redirect
allow-list before switching.

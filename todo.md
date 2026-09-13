# MoneyTrack — to do

Add new ideas under **Ideas** as they come up. When something is done, tick it and move it
to **Done** with the date. Put the app in brackets: [Web], [iOS] or [Both].

## Next up
- [ ] [Web] **Deploy** so the new legal pages and Settings → Legal go live. This is needed
      before any App Store submission, because Apple requires a privacy policy URL.
      Bump `VERSION` + `CHANGELOG.md` first. Deploy is the user's call.
- [ ] [iOS] The user should enter their name in Profile. It helps the classifier spot own
      transfers, and it syncs to the web app.
- [ ] [iOS] Check the Phase 4 and Profile screens in **dark mode** (only light mode was
      checked).

## App Store (iOS)
- [ ] Decide on a paid Apple Developer account. With a free account, apps installed from
      Xcode stop opening after 7 days.
- [ ] **In-app account deletion.** Apple requires it when an app lets you create an
      account. Careful: the login is shared with Heimat, so deleting the login deletes it
      for both apps. Maybe offer "delete my MoneyTrack data" (the `mt_*` rows) plus a
      separate full account deletion.
- [ ] App icon, screenshots, App Privacy "nutrition label" (matches `public/legal/privacy.html`),
      TestFlight.

## Open questions
- [ ] [Both] Should hand-entered accounts and transactions sync between web and iOS? Today
      they move with a one-time backup import (the user's choice for now).
- [ ] [Web] Write a current file map (`docs/legacy-map.md` only covers the old version).

## Ideas
- (add new ideas here)

## Done
- [x] 13 Sep: [Both] MoneyTrack's own privacy policy and terms, linked from both apps.
- [x] 13 Sep: [iOS] Phases 1–4 of copying the web app, profile button, installed on the iPhone, GitHub repo.
- [x] 13 Sep: [Web] V11.7 card bills and V11.8 starting-balance dates.
- [x] 13 Sep: [Both] Project docs (`core.md`, `update.md`, `todo.md`) and a tidied folder.

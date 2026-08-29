# tadapop-web

Marketing landing page for **Tadapop** — the gamified daily habit tracker.

- **Live:** https://tadapop.app
- **Stack:** static HTML/CSS (no build step). Brand: midnight navy + amber console aesthetic.
- **Install:** the home page offers open-beta installs (Android + iOS TestFlight) via QR codes — see the Beta install section below.
- **Support form:** messages on `/support` are relayed to the support inbox via [Formsubmit](https://formsubmit.co) (no backend).
- **Deploy:** auto-deployed to Vercel on every push to `main`.

## Structure
```
index.html        landing page (hero, features, beta install)
styles.css        theme + layout
android/          Android beta install page
rules/            Arena scoring rules (mirrors src/domain/progression.ts + src/features/arenaWins.ts in the app repo)
privacy/          Privacy Policy
terms/            Terms of Service
support/          Support + FAQ + contact form
assets/           favicon, og image, install QR codes
vercel.json       clean URLs + cache headers
```

## Beta install (Android + iOS)

The home page offers open-beta installs via QR codes in `assets/`:

- **Android:** `assets/qr-play.png` → the Google Play listing,
  `https://play.google.com/store/apps/details?id=com.qyllc.tadapop` (live since
  2026-08-29). The official Play badge is `assets/play-badge-en.png` /
  `assets/play-badge-zh.png`, downloaded unmodified from Google as their brand
  guidelines require — do not recolour or crop them.
  The older `assets/qr-android.png` (→ `/android`) and `android/qr.png` are now
  unused by the home page; `/android` survives as the sideload fallback for
  devices with no Play Store.
- **iOS:** `assets/qr-ios.png` → `https://testflight.apple.com/join/TtXzD68k`
  (same URL as the "Get it on iOS (TestFlight)" button in `index.html`).

**The iOS link points to the TestFlight _group_, not a fixed build.** `TtXzD68k`
is the public link for the **Friends** external group in App Store Connect, so it
always serves whatever build is currently assigned to Friends + enabled for
testing. To ship a new build to QR scanners, just add it to the Friends group in
App Store Connect — no change to the site or the QR image is needed.

_Verified 2026-06-23: QR image decodes to `…/join/TtXzD68k`, which matches the
Friends group's public link; that group was serving build 1.2.0 (50)._

## Local preview
Open `index.html` in a browser, or serve the folder:
```sh
npx serve .
```

## Universal links (`/join/<code>`)

Arena invites are `https://www.tadapop.app/join/ABC123`. On iOS with the app
installed, tapping one opens Tadapop straight on the invite; everyone else gets
`join/index.html`, which shows the code and a download link.

**Use `www`, not the apex.** `tadapop.app` 308-redirects to `www.tadapop.app`,
and Apple does NOT follow redirects when fetching the association file — an
invite pointed at the apex would never open the app, and nothing anywhere would
say why. The app declares `applinks:www.tadapop.app` for the same reason. If the
canonical host ever changes, `associatedDomains` in the app's `app.json` and
`SITE_URL` in `src/features/inviteLink.ts` must change with it.

Three things have to stay true or it silently stops working — silently is the
whole problem here, since a broken universal link just opens Safari and never
says why:

1. `/.well-known/apple-app-site-association` is served over HTTPS as
   **`application/json`**, with **no redirect**. The file has no extension, so
   the `Content-Type` header in `vercel.json` is what makes it valid. A copy
   sits at the site root too, which older iOS checks as a fallback.
2. The `appIDs` entry is `<TEAM_ID>.<BUNDLE_ID>` — `WT6P5XQB6Y.com.qyllc.tadapop`.
   If either ever changes, this file must change with it.
3. The app declares `associatedDomains: ["applinks:tadapop.app"]`. That's an
   **entitlement**, so it only takes effect in a new native build — never via an
   OTA update.

Check the file is being served correctly with:

```sh
curl -sI https://www.tadapop.app/.well-known/apple-app-site-association \
  | grep -i 'content-type\|HTTP/'
# want: HTTP/2 200 and content-type: application/json — a 308 here means it's broken
```

Apple caches this on their CDN, so a fresh install (or a reinstall) is the
reliable way to test a change.

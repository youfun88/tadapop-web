# tadapop-web

Marketing landing page + waitlist for **Tadapop** — the gamified daily habit tracker.

- **Live:** https://tadapop.app
- **Stack:** static HTML/CSS (no build step). Brand: midnight navy + amber console aesthetic.
- **Waitlist:** emails POST to a write-only `waitlist` table in the Tadapop Supabase project (RLS allows insert, not read).
- **Deploy:** auto-deployed to Vercel on every push to `main`.

## Structure
```
index.html        landing page (hero, features, waitlist)
styles.css        theme + layout
privacy/          Privacy Policy
terms/            Terms of Service
support/          Support + FAQ
assets/           favicon, og image
vercel.json       clean URLs + cache headers
```

## Beta install (Android + iOS)

The home page offers open-beta installs via QR codes in `assets/`:

- **Android:** `assets/qr-android.png` → Play Store / APK link.
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

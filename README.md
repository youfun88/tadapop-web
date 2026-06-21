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

## Local preview
Open `index.html` in a browser, or serve the folder:
```sh
npx serve .
```

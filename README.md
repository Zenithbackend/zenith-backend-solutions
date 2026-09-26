# Zenith Backend Solutions: website

Static site. No build step, no runtime CSS compiler. Open `index.html` or serve the folder with any static host.

```
index.html · services.html · who-we-serve.html · about.html · contact.html · 404.html
assets/style.css   design system (tokens at the top: midnight / ivory / cobalt)
assets/main.js     all interaction, dependency-free
assets/logo.png    original brand mark (header, footer, hero + CTA watermark)
assets/favicon.ico, favicon-32.png, icon-192/512.png, apple-touch-icon.png   generated from the logo
assets/og-image.png   1200x630 social-share card (regenerate if the tagline changes)
sitemap.xml · robots.txt
```

## Things to know
- **Shared chrome is duplicated per page** (header, mobile sheet, footer, trial modal, sprite). Edit it in all six HTML files.
- **Forms** post to Formspree (`https://formspree.io/f/mbdvalee`, same endpoint as before) via the form `action`, so they still work without JavaScript. A honeypot field (`_gotcha`) is included.
- **Deep links:** `contact.html#trial` opens the trial modal.
- **Illustrative content** (hero close board, review-flow artifacts) is labelled "Illustrative". Replace with real figures only if you can support them.
- **Before launch:** `Privacy Policy` and `Terms & Conditions` still link to `#`. Add the pages and update the footer in all six files. 
- Fonts: Source Serif 4 + IBM Plex Sans from Google Fonts, with system fallbacks. Self-host them if you want zero third-party requests.

## SEO / trust notes
- Canonical for the home page is `https://www.zenithbackendsolutions.com/` (not `/index.html`); make sure the host serves the root.
- Structured data is one `@graph` (AccountingService, WebSite, BreadcrumbList) per page. Add `address`, `sameAs` (LinkedIn etc.) and `aggregateRating` only when real.
- Trust strip on the home page (`.trust`, `.pullq` in `index.html`): edit the tool chips and add CPA licence details where the HTML comments say so.

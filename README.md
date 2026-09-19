# Zenith Backend Solutions: website

Static site. No build step, no runtime CSS compiler. Open `index.html` or serve the folder with any static host.

```
index.html · services.html · who-we-serve.html · about.html · contact.html · 404.html
assets/style.css   design system (tokens at the top: midnight / ivory / cobalt)
assets/main.js     all interaction, dependency-free
assets/logo.png    original brand mark (favicon, header, footer)
sitemap.xml · robots.txt
```

## Things to know
- **Shared chrome is duplicated per page** (header, mobile sheet, footer, trial modal, sprite). Edit it in all six HTML files.
- **Forms** post to Formspree (`https://formspree.io/f/mbdvalee`, same endpoint as before) via the form `action`, so they still work without JavaScript. A honeypot field (`_gotcha`) is included.
- **Deep links:** `contact.html#trial` opens the trial modal; `services.html?for=firm` opens Services in the CPA-firm view.
- **Illustrative content** (hero close board, review-flow artifacts) is labelled "Illustrative". Replace with real figures only if you can support them.
- **Before launch:** `Privacy Policy` and `Terms & Conditions` still link to `#`. Add the pages and update the footer in all six files. Also add an `og:image` if you want rich link previews.
- Fonts: Newsreader + Instrument Sans from Google Fonts, with system fallbacks. Self-host them if you want zero third-party requests.

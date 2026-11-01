# XZoom Chrome Web Store submission

Package: XZoom **1.0.1**, a store metadata revision of the public GitHub 1.0.0 release. Four localized names and summaries, the manifest homepage and the version were revised. Image runtime code and permission scope are unchanged. This task does not reload the installed extension.

`listing.json` is the source for four language descriptions and privacy justifications. `prepare-art.mjs` creates a synthetic field-notes image and description files. `poster.html` renders the real `src/content.js` and `src/content.css` with the shipped Panzoom library and locale messages. The surrounding demonstration has no real account information. `render.mjs` captures 1280×800 JPEGs in the user-authorized, separate store browser on port 9333, plus a 440×280 promotional tile. It closes only the artwork tab it creates.

```sh
node tools/store-listing/package-check.mjs
node tools/store-listing/prepare-art.mjs
node tools/store-listing/preview-server.mjs
# In another terminal, after the dedicated store browser is available:
node tools/store-listing/render.mjs
```

Render output: ignored `artifacts/store/screenshots/`. Inspect all eight screenshots before upload. Global screenshots use the English pair; Chinese, Portuguese and Spanish each receive their complete corresponding pair. All screenshots must be 1280×800 RGB JPEG, without alpha.

Privacy policy: <https://github.com/wangsen2020/xzoom/blob/master/PRIVACY.md>. The extension processes preview URLs locally and requests original image data from X's CDN. It does not fetch executable code or send images to an AI service. Do not describe it as entirely offline or as making no network requests.

The website already includes BlogPosting, BreadcrumbList and a Keep Reading section. Google's HowTo rich results were discontinued in September 2023; do not add schema while promising step cards. New SEO candidates require search-demand evidence; do not invent traffic, conversion or ranking claims.

Current status: XZoom **1.0.1** was re-submitted on 2026-11-01 19:03:37 Asia/Shanghai, after canceling the original 1.0.0 review to correct localized discovery text. The console confirms **Pending review** with automatic publication after approval. Item ID: `cpifmmigfjmkifiogccbllkcoifllpnd`. All four titles, summaries and descriptions were read back against listing.json, with the existing eight screenshots retained. No approval or public store availability is claimed.

GoodExts 1.4.2 deployed the public HTML verification challenge. The store account is now a verified GSC owner and both Official URL and Homepage URL were saved as https://goodexts.com/. Keep the challenge file in future deployments. Keyword evidence and gaps are in keywords-20261101.md and three raw autocomplete JSON files. Nine unit tests, package checks and real Chrome acceptance in English, Chinese, Portuguese and Spanish passed. The 1.0.1 GitHub delivery includes this source and listing material, the ready ZIP and SHA256SUMS. GoodExts serves the same ready ZIP. GitHub delivery and Chrome Web Store review are independent states.

Privacy disclosure: Website content is declared because the current photo and media URL are processed locally. All other data types are unchecked, and no remote code is used. The developer receives no user data; normal requests go to X's image CDN.

Console: <https://chrome.google.com/webstore/devconsole/30996508-d849-4d92-830c-ab9c1424083b/cpifmmigfjmkifiogccbllkcoifllpnd/edit/status>.

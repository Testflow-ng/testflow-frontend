# Landing pages from config

A landing page is **one content file + one route**. The layout, nav, footer, SEO and JSON-LD come from `<LandingTemplate config={...} />`.

## Add a new landing page
1. Create `src/content/landing/<name>.js` exporting a config (copy `everybody.js`):
   - `seo`: `{ route, title, description, keywords, image, imageAlt, noIndex }`
   - `jsonLd(plans)`: returns the JSON-LD object (keep FAQ text identical to the on-page FAQ by sharing the same array)
   - `nav`: `{ links, loginTo, primary }`
   - `plans` (optional): `{ path, fallback, copy }`. Plans are fetched for display only, with the fallback used if the request fails.
   - `sections`: an ordered list of `{ type, ... }`
2. Add a page file: `export default () => <LandingTemplate config={yourConfig} />`.
3. Add a lazy route in `src/routes/router.jsx` and list the path in `RootLayout.jsx` `isLandingPath` so the app header is hidden.
4. SEO and crawlers: add the page (and its image) to `PRERENDER` in `vite.config.js`, add a `PAGES` entry in `src/components/Seo.jsx`, add the URL to `public/sitemap.xml`.
5. OG image: add `scripts/og-template-<name>.html` and a `render` line in `scripts/generate-og.sh`.

## Section types
`hero`, `trust`, `audience`, `howItWorks`, `features`, `preview`, `plans` (also renders the comparison table), `faq`, `finalCta`, and `custom` (`{ type: 'custom', component: 'key' }`, registered in `LandingTemplate.jsx`).
Hero visuals are chosen by name from `components/landing-template/visualMap.js`. Icons are referenced by name from `icons.js`. Content files must stay pure data (no JSX) because the build reuses them.

## Status
- `ads.js` and `everybody.js` use the template.
- The main home page (`src/pages/HomePage.jsx`) is **not** migrated: it must stay identical, so it was left as is (see `main.js`).
- Product naming for Testflow for Everyone lives in `src/constants/products.js`.

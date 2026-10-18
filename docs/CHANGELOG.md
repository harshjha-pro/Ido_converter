# Changelog

## 0.6.0 — 18 October 2026
Owner decisions: domain idoconverter.com (no www); build everything the prompts describe that needs no outside service; accounts, payments and AI wait for keys and budget.
- **Added:** bulk watermark tool (`/tools/watermark`): text or logo, nine positions or repeated, opacity, size, margin, output format.
- **Added:** editable templates (`/templates`, `/templates/[id]`): 8 original designs in 4 sizes (1080², 1080×1350, 1080×1920, 1280×720); edit text and size, colours, photo, logo; undo/redo; draft kept in the browser; PNG/JPG download. Preview and export share one renderer.
- **Added:** brand kit (`/brand-kit`, noindex) and named saved settings in the converter, watermark and product-photo tools, all in browser storage only.
- **Added:** product photos for several marketplaces in one run, one ZIP with a folder and report per marketplace.
- **Added:** `/tools` directory, `/about`, `/pricing` (free during early access, no invented prices); header now Product photos · Tools · Templates · Photo guide · Pricing; home links to every tool.
- **Changed:** privacy notice restructured for the DPDP Act (itemised data, purposes, retention, rights, Data Protection Board route); contact shown from `NEXT_PUBLIC_SUPPORT_EMAIL`. Early-access form carries a standalone itemised notice; `CONSENT_VERSION` → `2026-10-18.2`. Terms gain watermark, template and governing-law (India) clauses. **Self-reviewed, not lawyer-reviewed.**
- **Changed:** Meesho preset minimum side 800 → 1000 px (most-repeated third-party figure); preset sources say the official rules are behind seller logins.
- **Changed:** converter and watermark share `components/tool/batch/BatchWorkbench.tsx`.
- **Fixed:** breadcrumbs broke into indented lines on content pages; `/product-photos` source notes rendered as a grid; a racy DB e2e journey (other tests also posted statistics).
- **Tests:** 86 unit (+27), 101 e2e (+16 per viewport); every public page checked at 360, 768 and 1024 px.

## 0.5.1 — 18 October 2026
- **Fixed (accessibility):** removing a file with the keyboard dropped focus to the top of the page; focus now moves to the next file's Remove button, or the drop zone when the list is empty (`components/tool/focus.ts`).
- **Fixed (accessibility):** the phone details sheet is announced as a modal dialog but Tab escaped to the page behind it after three stops; Tab and Shift+Tab now stay inside until it closes.
- **Added:** 2 keyboard e2e tests (focus after removal; sheet focus containment and return on Escape).
- **Checked, not changed:** Flipkart and Meesho image rules. No official public page exists (both are behind seller logins); public third-party guides contradict each other. Presets stay labelled Unverified.

## 0.5.0 — 18 October 2026
- **Added (converter):** Shape step — Original, 1:1, 4:5, 4:3, 3:2, 16:9, 9:16 or a custom ratio — with *Crop to fit* (centre) or *Add padding* (whole image, centred). Background: white, black, transparent (PNG/WebP) or a custom colour; it also fills transparent areas. A custom ratio plus resize-by-width gives exact sizes (e.g. 1200 × 628).
- **Added:** uploads are judged by their first bytes, not the file name or the browser's reported type. A PNG named `.jpg` is accepted as PNG; non-images named `.png` are refused at the door.
- **Added:** remove a file after processing in both tools (it leaves the ZIP and the CSV); "Download this photo" in the product-photo inspector.
- **Added (SEO/content):** `/product-photos` now has a preset comparison table (rendered from `lib/presets.ts`, with sources and verification labels), a Pass/Check/Fail explainer matching the engine, and a FAQ.
- **Security:** no inline `style` attributes remain, so production CSP is `style-src 'self' 'nonce-…'` (no `'unsafe-inline'`). HSTS (`max-age=31536000`, no subdomains/preload) in production.
- **Changed:** `Workbench.tsx` split into `product/ProductSettings`, `product/Inspector`, `product/types`; converter settings in `converter/ConverterSettings` with form logic in `lib/image/converterForm.ts`. One `outputName` for both tools.
- **Fixed:** settings fields overflowed the 300 px panel (grid `minmax(0, 1fr)`; inputs size from their container).
- **Tests:** 59 unit (+15), 66 e2e (+11 per viewport), including pixel checks of real output files and layout regression checks (header styles, no sideways scroll at 360 px, settings fit their panel).

## 0.4.0 — 18 October 2026
- **Added:** Content-Security-Policy on every HTML page (`middleware.ts`, `lib/csp.ts`): per-request script nonce with `'strict-dynamic'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri`/`form-action 'self'`, `connect-src 'self'`, `worker-src 'self' blob:`. `'unsafe-eval'` only under `next dev`.
- **Changed:** pages are now rendered per request (needed for fresh nonces); see ADR-13. About 10 ms per page locally.
- **Changed:** Zod runs in `jitless` mode, so its eval probe no longer trips the CSP.
- **Added:** `tests/unit/csp.test.ts` (3) and `e2e/csp.spec.ts` (3 per viewport): header and fresh nonce on every page, nonce on every inline script, no policy on API/static files, and a full sample batch with zero CSP violations.
- **Changed:** the repository now holds this Next.js app (the previous Astro site is in git history); CI runs lint, typecheck, unit tests and build.

## 0.3.0 — 18 October 2026
- **Added:** bulk image converter (`/tools/image-converter`): JPG/PNG/WebP, resize by longest side, width or height, quality, rotate, flip, per-file download, ZIP.
- **Added:** technical SEO: canonical URLs, Open Graph/Twitter tags, OG image, robots.txt, sitemap.xml, JSON-LD (WebSite, Organization, WebApplication, BreadcrumbList), breadcrumbs.
- **Added:** Terms of use (draft), runtime error page, leave-page warning during processing.
- **Added:** ESLint, axe accessibility tests, converter, SEO and accessibility e2e suites.
- **Fixed:** shared rate-limit bucket lockout when the client IP is unknown; layout shift on `/product-photos`; three over-long titles; duplicate brand in the homepage title; internal links using `<a>`.
- **Fixed:** lockfile repaired so `npm ci` works with both npm 10 and npm 11 (an npm 11-generated lockfile omitted optional entries npm 10 requires).
- **Docs:** audit, PRD, feature catalogue, architecture, ADRs, testing, security, SEO, operations, legal readiness, index.

## 0.2.0 — 18 October 2026
- Backend: early-access sign-ups, anonymous batch statistics, health check; MySQL migrations, scripts and tests.

## 0.1.0 — 17 October 2026
- Homepage, product-photo tool, photo guide, privacy notice, design system.

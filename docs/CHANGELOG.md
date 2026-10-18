# Changelog

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

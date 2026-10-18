# Changelog

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

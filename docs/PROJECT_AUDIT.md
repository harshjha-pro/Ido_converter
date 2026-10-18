# Project audit

_Last reviewed: 18 October 2026. Baseline taken from the actual repository and test runs, then updated with what this session fixed._

## Baseline (start of session)

| Area | Finding |
|---|---|
| Stack | Next.js 15.5.27, React 19.2.8, TypeScript 5.9 strict, CSS Modules + tokens, Drizzle + mysql2, Zod 4 |
| Routes | `/`, `/product-photos`, `/photo-guide`, `/privacy`, 404, `/api/health`, `/api/early-access`, `/api/events/batch` |
| Working features | Product-photo batch tool (white background, centring, sizing, compression, renaming, pass/check/fail report, ZIP + CSV), early-access sign-ups, anonymous batch statistics |
| Tests | Vitest unit/component (34), DB integration (20), Playwright e2e (8): all passing |
| Lint/format | No linter or formatter configured |
| Build | Passing; static pages, 3 dynamic API routes |
| Security | Origin checks, strict validation, rate limits, parameterised SQL, security headers; nonce-based CSP |
| SEO | Titles and descriptions only; no canonical, robots.txt, sitemap, OG image or structured data |
| Accessibility | Manual keyboard tests only; no automated scan |
| Docs | README, backend.md, DESIGN.md and 8 backend docs |

## Findings

| # | Severity | Finding | Status |
|---|---|---|---|
| A1 | **High** | Core MVP converter (JPG/PNG/WebP, resize, compress, rotate, flip) missing | **Fixed**: `/tools/image-converter` |
| A2 | **High** | No robots.txt, sitemap, canonical URLs, OG tags or structured data | **Fixed**, with tests |
| A3 | **High** | No Terms page although personal data is collected | **Fixed**: draft at `/terms` (legal review pending) |
| A4 | **High** | Rate limiting falls back to one shared bucket if the client IP header is missing: the whole site would allow 5 sign-ups/hour | **Fixed**: 20× shared limit plus a warning log; test added |
| A5 | **High** | No testing on real phones (only emulation) | **Open**: needs devices (see KNOWN_ISSUES) |
| A6 | **High** | No contact or support channel unless the WhatsApp number is configured | **Open**: needs owner details |
| A7 | Medium | No linter | **Fixed**: ESLint (next/core-web-vitals + TypeScript); one real error fixed |
| A8 | Medium | No automated accessibility checks | **Fixed**: axe on every page and key states; 0 violations |
| A9 | Medium | Layout shift 0.177 on `/product-photos` (phone, lab) | **Fixed**: 0.003 |
| A10 | Medium | No runtime error page | **Fixed**: `app/error.tsx` |
| A11 | Medium | Closing the tab mid-batch loses work without warning | **Fixed**: leave-page warning while processing |
| A12 | Medium | No Content-Security-Policy | **Fixed** (0.4.0): nonce CSP via middleware, e2e-tested |
| A13 | Medium | Titles over 70 characters on 3 pages | **Fixed**, enforced by test |
| A14 | Low | `Workbench.tsx` is about 480 lines | Open: split once a third tool reuses parts |
| A15 | Low | Dev-only `braces` advisory via eslint-config-next; no patched version exists | Accepted; production audit is 0 (THREAT_MODEL S9) |
| A16 | Low | No formatter (Prettier) | Open: optional; the codebase is consistent |
| A17 | Low | HEIC, GIF and SVG not accepted | By design; documented to users |

## Current quality gates (end of session)

| Gate | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | Pass |
| Lint | `npm run lint` | Pass, 0 warnings |
| Unit + component | `npm test` | 41 passed |
| DB + API integration | `npm run test:db` | 21 passed |
| End-to-end + SEO + axe (desktop + phone) | `npm run test:e2e` | 38 passed |
| Production build | `npm run build` | Pass |
| Dependency audit | `npm audit --omit=dev` | 0 vulnerabilities |

Full results: `TEST_RESULTS.md`.

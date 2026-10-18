# Test results

_Executed 18 October 2026 in the development container: Node 22.22, Chromium 141 (Playwright 1.56), MariaDB 10.11.14. Production build served by `next start`._

| Gate | Result | Notes |
|---|---|---|
| `npm run typecheck` | **Pass** | |
| `npm run lint` | **Pass** (0 errors, 0 warnings) | 1 real error fixed (plain `<a>` for internal links) |
| `npm test` (unit + component) | **44 passed** | +3 CSP unit tests (0.4.0 re-run) |
| `npm run test:db` | **21 passed**, 1 skipped (notice shown only when no DB) | |
| `npm run test:e2e` | **40 passed, 4 skipped** (0.4.0 re-run, no DB) | +6 CSP tests; the 4 skips need `E2E_DATABASE_URL`. Earlier full run with DB: 38 passed. 8 axe scans per viewport, 0 violations |
| `npm run build` | **Pass** | Pages rendered per request (CSP nonce); robots/sitemap static |
| `npm audit --omit=dev` | **0 vulnerabilities** | Dev-only `braces` advisory accepted (THREAT_MODEL S9) |
| 100-photo stress (product photos) | **Pass**: about 76 s, 100/100 processed; Stop works | Headless Chromium, synthetic 6–12 MP JPEGs |
| Lab performance | LCP 84–972 ms; CLS ≤ 0.003 after fix | See below. **Lab, not field data.** |

## Lab performance (headless Chromium, localhost)
| Page | Desktop LCP | Phone (4× CPU, throttled network) LCP | CLS |
|---|---|---|---|
| `/` | 284 ms | 708 ms | 0 |
| `/product-photos` | 84 ms | 608–960 ms | 0.003 (was 0.177) |
| `/tools/image-converter` | 152 ms | 448 ms | 0 |
| `/photo-guide` | 184 ms | 468 ms | 0 |

First-load JS: shared 103 KB; homepage 137 KB (includes Zod for the form); tool pages 119–122 KB.

## 0.5.0 run (18 October 2026)
Clean production build served by `next start`, MariaDB 10.11.14 installed in the container, Chromium 141 via Playwright 1.56.

| Gate | Result |
|---|---|
| `npm run lint`, `npm run typecheck` | Pass |
| `npm test` (unit + component) | **59 passed** |
| `npm run test:db` | **21 passed**, 1 skipped (the no-DB notice) |
| `npm run test:e2e` (with `E2E_DATABASE_URL`) | **66 passed** (33 desktop + 33 phone), 0 skipped |
| `npm run build` | Pass; first-load JS: shared 103 KB, `/` 138 KB, `/product-photos` 123 KB, converter 120 KB |
| `npm audit --omit=dev` | 0 vulnerabilities (full audit: the accepted dev-only `braces` chain, A15) |
| Network check (both tools, scripted) | 0 third-party requests; the only POST is the 214-byte anonymous batch summary |
| 360 px | No sideways scroll on any public page (e2e); screenshots of both tools reviewed |

Lab (headless Chromium, localhost; **lab, not field data**). Phone = 360 px, 4× CPU, 150 ms latency, 1.6 Mbps.

| Page | Desktop LCP | Phone LCP | CLS |
|---|---|---|---|
| `/` | 316 ms (cold start) | 624 ms | 0 |
| `/product-photos` | 152 ms | 576 ms | 0 |
| `/tools/image-converter` | 108 ms | 552 ms | 0 |
| `/photo-guide` | 104 ms | 512 ms | 0 |

Defects found in this run and fixed: an edit script emptied `components/site/site.module.css` (header and footer unstyled; caught by screenshot review, now guarded by an e2e test); settings fields overflowed their 300 px panel (caught by a new e2e test).

Not re-run: the 100-photo Python stress test (engine unchanged for product photos).

## CSP check (0.4.0, 18 October 2026)
Re-run on a clean production build without a database: lint, typecheck, 44 unit tests, 40 e2e (4 DB-only skipped), production audit 0. Manual probes: a nonce-less inline script and an inline `onerror` handler injected into the served HTML were both blocked, and the page still hydrated. `npm run dev` checked: converter works, no CSP errors. `npm run test:db` was not re-run (no DB in this container; no server code changed).

## Defects found and fixed during testing
1. Shared rate-limit bucket when the client IP is unknown (High) → 20× shared limit + warning.
2. Three titles over 70 characters → shortened; enforced by a test.
3. Layout shift 0.177 on `/product-photos` (phone) → placeholder of the same size.
4. Homepage title duplicated the brand → absolute title.
5. Canonical and sitemap root mismatch (trailing slash) → aligned.
6. Linter error: plain `<a>` for internal navigation → `Link`.
7. Zod's eval probe raised a CSP violation on the homepage → `z.config({ jitless: true })` (0.4.0).

## Not executed (blocked or out of reach)
- Real Android and iPhone devices; Safari and Firefox engines.
- Hostinger's MySQL (version and IP header unverified).
- Screen-reader walkthrough (NVDA/VoiceOver).
- Field Core Web Vitals (need real traffic and Search Console).

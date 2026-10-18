# Test strategy and plan

| Layer | Tool | Scope | Data | Where |
|---|---|---|---|---|
| Unit | Vitest (node) | Validation, contact normalisation, naming, CSV escaping, ZIP CRC, rate-limit maths, converter size maths, server/client import boundary | Inline synthetic values | `tests/unit` |
| Component | Vitest + RTL + jsdom | Early-access form: validation, success, server errors, 429, offline | Mocked `fetch` | `tests/components` |
| Integration | Vitest + real MySQL/MariaDB | Migrations (fresh, re-run, tamper), schema ↔ ORM consistency, constraints, handlers end to end, idempotency under concurrency, injection, rate limits, unknown IP, DB down or unconfigured | Throwaway `*_test` database | `tests/integration` |
| E2E | Playwright (desktop 1440 + Pixel 5 dark) | Journeys, converter outputs (bytes parsed), SEO metadata, robots/sitemap, 404 | Synthetic fixtures in `e2e/fixtures` | `e2e/` |
| Accessibility | axe-core (WCAG 2.0/2.1/2.2 A and AA tags) + manual keyboard | All public pages, tool results state, form error state | — | `e2e/seo-a11y.spec.ts` |
| Stress / perf (lab) | Python Playwright scripts | 100-photo batch, main-thread responsiveness, LCP/CLS with CPU and network throttling | Generated images | Results in TEST_RESULTS.md |
| Manual | Checklist | Real devices, Safari, screen reader, slow networks | — | RELEASE_CHECKLIST.md |

**Negative cases covered:**
- unsupported MIME and fake extensions
- empty and corrupt files
- over 100 files
- duplicate names
- formula-like names
- zero, negative and out-of-range sizes
- malformed JSON, wrong content type, oversized bodies, foreign origins
- repeated and concurrent submissions
- rate limits
- missing environment variables
- database outage

**Not automated:** real browsers other than Chromium, real devices, and memory pressure on low-end phones. These are manual gates.

**Never:** use customer data in fixtures; test destructively against production.

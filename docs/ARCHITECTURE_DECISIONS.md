# Architecture decision records

| # | Decision | Context | Alternatives | Consequences |
|---|---|---|---|---|
| ADR-1 | Process images in the browser | Shared hosting; privacy; zero per-use cost | Server processing (sharp), external API | Speed depends on the device; there's a memory ceiling, so limits are needed; privacy claim is true |
| ADR-2 | Web Worker with main-thread fallback | Big flood fills froze the UI | Main thread only | Responsive UI (measured); two code paths share one engine |
| ADR-3 | Next.js 15.5 (not 16), exact pins, ≥ 14-day-old releases | Stability, supply-chain risk | Latest versions | Slower to receive features; audited |
| ADR-4 | CSS Modules + tokens, no Tailwind | Working, token-based system exists | Tailwind | No migration churn; tokens are the single source |
| ADR-5 | MySQL (Hostinger), SQL portable to MySQL 8 / MariaDB 10.6 | Hostinger offers MySQL only | Managed Postgres | No extra cost; no JSON columns |
| ADR-6 | Hand-written SQL migrations + Drizzle for queries + a consistency test | drizzle-kit output isn't phpMyAdmin-importable | drizzle-kit migrations | Two definitions, kept equal by a test |
| ADR-7 | No accounts in the MVP | Validation first | Auth now | No session or IDOR risk; repeat users can't be identified |
| ADR-8 | Rate limits in MySQL keyed by HMAC(IP) | No Redis; privacy | In-memory (lost on restart, not shared), Redis | Small write per request; unknown-IP fallback at 20× |
| ADR-9 | Store-only ZIP writer (own code) | No CDN or dependency; JPEGs don't compress | fflate/JSZip | ~70 lines, tested; bigger ZIPs for PNG batches |
| ADR-10 | No admin web UI; CLI export | Smallest attack surface | Admin pages | Owner needs DB credentials and a terminal |
| ADR-11 | Anonymous statistics without identifiers; GPC respected | Need metrics, avoid personal data | Third-party analytics | No user-level funnels |
| ADR-12 | Unknown client IP → shared bucket at 20× limit | Proxy header may be missing | Fail open (no limit) / fail closed (5/h sitewide) | Some abuse protection without locking users out |
| ADR-13 | Nonce-based CSP via middleware; pages rendered per request | XSS defence-in-depth; Next.js inline scripts need a nonce that changes per response | Hash-based CSP on static pages (no built-in Next.js support), `'unsafe-inline'` scripts (weak) | Fresh nonce per view; pages are no longer static HTML (~10 ms render locally); styles nonce'd too since 0.5.0 |

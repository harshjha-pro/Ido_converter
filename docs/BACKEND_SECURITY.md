# Backend security

## Threat model (current scope)

Public, unauthenticated endpoints storing a small amount of personal data (lead contacts). Main risks:
- spam and automated sign-ups
- injection
- cross-site request abuse
- data exposure through logs or errors
- denial of service on a shared host

## Controls in place

| Risk | Control | Verified by |
|---|---|---|
| SQL injection | Parameterised queries only (Drizzle and `?` placeholders); `multipleStatements` off for the app pool | Integration test stores `'); DROP TABLE …` literally; the table survives |
| Mass assignment / unexpected fields | Strict Zod objects reject unknown keys | Unit + integration tests |
| Cross-site requests | `Origin` must equal `APP_ORIGIN`; missing `Origin` → 403; JSON-only (blocks simple HTML form posts) | Integration tests (403, 415) |
| Oversized bodies | 8 KB cap, checked on the header and the actual body | Integration test (413) |
| Spam and bots | Honeypot field (silent 202); 5 sign-ups per hour per client | Integration tests |
| Abuse of statistics | 60 per hour per client; DB CHECKs on counts | Integration tests |
| IP privacy | Only HMAC-SHA256(IP, secret) is stored, deleted within a day | Unit + integration tests |
| Error leakage | Generic 503 messages; driver codes only in logs; `requestId` for tracing | Integration test checks no host, port or driver text |
| Secrets | Server-only env vars validated at startup; the only public value is the WhatsApp number; `.env*.local` git-ignored | Unit test: no client component imports `lib/server` |
| Spreadsheet formula injection | CSV cells starting with `= + - @` are prefixed with `'` (report CSV and lead export) | Unit test |
| Admin exposure | No admin web UI; data exported with DB credentials via CLI | — |
| Headers | `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; `X-Powered-By` removed | Manual (curl) |
| Dependency risk | Exact pins, releases ≥ 14 days old, `npm audit`: 0 vulnerabilities (18 Oct 2026) | `npm audit` |
| Shared-host exhaustion | Pool of 3, bounded queue, 5 s connect timeout | Code review |

## Operational checklist

- Generate `IP_HASH_SECRET` with `openssl rand -hex 32`; never reuse it elsewhere. Rotating it only resets rate-limit counters.
- Give the runtime DB user `SELECT, INSERT, UPDATE, DELETE` only. Run migrations with a separate user.
- Keep Remote MySQL access limited to your own IP while migrating, then remove it.
- Never commit `.env.local`. Treat lead exports as personal data: store them privately and delete them after use.
- Run `npm audit` before each deploy.

## Known gaps

- **Client IP source.** If Hostinger doesn't pass `X-Forwarded-For`, all visitors share one rate-limit bucket. Confirm after deploying (`docs/ENVIRONMENT_CONFIGURATION.md`).
- **No CAPTCHA.** Add one only if spam gets past the honeypot and rate limits.
- **CSP allows inline styles.** Scripts need a per-request nonce (`middleware.ts`); styles keep `'unsafe-inline'` for React `style` attributes (KNOWN_ISSUES K7).

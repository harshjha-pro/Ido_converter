# Idoconverter backend

_Status: implemented and tested, 18 October 2026. This file describes what exists in the code. Deferred features are listed at the end and are **not** implemented._

## 1. Overview

The product's core work — preparing images — happens in the visitor's browser (`lib/image/*`, Web Worker). The backend is deliberately small. It exists for the validation phase:

| Responsibility | Why it needs a server |
|---|---|
| Early-access sign-ups | Collect interested sellers and cataloguers, with consent, for follow-up |
| Anonymous batch statistics | Measure the go/no-go metrics: completed batches, pass rates, devices, speed |
| Abuse protection | Rate-limit public endpoints without storing IP addresses |
| Health check | Confirm the app can reach MySQL after each deploy |

Images, file names and photo contents never reach the server.

## 2. Runtime and hosting

- **Runtime:** Next.js 15.5 route handlers on Node.js (`runtime = "nodejs"`), served by `next start` as a Hostinger **Node.js Web App** (Business plan).
- **Pages** are static; only `/api/*` runs per request.
- **Database:** Hostinger's MySQL service, which is the only database engine Hostinger shared hosting offers. SQL targets the subset shared by **MySQL 8.0.16+** and **MariaDB 10.6+**; tested on MariaDB 10.11.
- **No background workers, cron or system packages are required.** Rate-limit cleanup runs opportunistically inside requests.

## 3. Communication

Browser → `fetch` → JSON over HTTPS → `app/api/**/route.ts` → `lib/server/handlers.ts` → services → Drizzle/mysql2 → MySQL.

All responses share one shape:

```json
{ "ok": true,  "data": { ... } }
{ "ok": false, "error": { "code": "validation_failed", "message": "…", "fields": { "contact": "…" } }, "requestId": "uuid" }
```

`Cache-Control: no-store` is set on every API response. Full contract: `docs/API_SPECIFICATION.md`.

## 4. Module structure

```
app/api/health/route.ts          GET  → handleHealth
app/api/early-access/route.ts    POST → handleEarlyAccess
app/api/events/batch/route.ts    POST → handleBatchEvent
lib/validation.ts                Zod schemas shared by browser and server (server re-validates)
lib/server/env.ts                Validated server environment
lib/server/http.ts               Response helpers, Origin/Content-Type/size/JSON guards
lib/server/rateLimit.ts          HMAC'd client keys, fixed-window counters in MySQL
lib/server/log.ts                Structured JSON logs without personal data
lib/server/handlers.ts           Request → validation → rate limit → service → response
lib/server/services/earlyAccess.ts   Idempotent upsert of a lead
lib/server/services/batchEvents.ts   Insert of an anonymous batch summary
lib/server/db/schema.ts          Drizzle models (typed queries)
lib/server/db/client.ts          Pooled mysql2 connection (default 3), UTC
database/migrations/*.sql        Source of truth for DDL
scripts/db-*.mjs                 Migrate, verify, seed (dev/test only), export leads
```

Handlers are plain functions of a `Request`, so integration tests call them directly with real database access.

## 5. Request pipeline (public POST endpoints)

1. **Service readiness:** if `DATABASE_URL` or `IP_HASH_SECRET` is missing → `503 service_unavailable`. The rest of the site keeps working.
2. **Origin check:** `Origin` must equal `APP_ORIGIN` (plus localhost outside production) → otherwise `403`.
3. **Content-Type** must be `application/json` → otherwise `415`.
4. **Body** ≤ 8 KB → otherwise `413`; must parse as JSON → otherwise `400`.
5. **Zod validation**, strict (unknown fields rejected) → `422` with per-field messages.
6. **Rate limit** per HMAC'd client IP → `429` with `Retry-After`. If the IP header is missing, all such requests share one bucket at 20× the limit, and `client_ip_unknown` is logged.
7. **Service call** with parameterised queries.
8. **Database errors** → `503 database_unavailable` with no internal details. The error code and request ID are logged.

## 6. Authentication and authorisation

**There are no user accounts in the approved MVP**, so there is no login, session or password handling. That's why `docs/AUTHENTICATION.md` doesn't exist yet. Protection for the public endpoints comes from same-origin checks, strict validation, rate limits and a honeypot field.

Administrative access is **not** a web feature. The owner reads data with `npm run leads:export` or phpMyAdmin, using database credentials that never reach the browser. This removes a whole class of admin-panel vulnerabilities.

## 7. Database access

- Drizzle ORM (`drizzle-orm/mysql2`) for typed inserts; raw `pool.execute` with `?` placeholders for the rate limiter. Both are parameterised; no SQL is built from strings containing user input.
- The schema lives in `database/migrations/*.sql`. `tests/integration/backend.test.ts` fails if the Drizzle models and the migrated tables differ in any column, type, signedness or nullability.
- Idempotency: one row per contact (`UNIQUE (contact_type, contact_value)`) with `INSERT … ON DUPLICATE KEY UPDATE`. Tested with 8 concurrent duplicate submissions → 1 row, `submissions = 8`.
- Connection pool: 3 connections by default (`DB_POOL_SIZE`), 5 s connect timeout, bounded queue, UTC timezone.

Details: `docs/DATABASE_DESIGN.md`.

## 8. Storage

No file storage. Images are processed and downloaded in the browser. Nothing is uploaded, so there's no object storage, upload endpoint or image retention to manage.

## 9. External integrations

None. No AI, payments or email providers are connected. WhatsApp links are plain `wa.me` URLs opened by the visitor; the server doesn't talk to WhatsApp.

## 10. Logging and monitoring

- `lib/server/log.ts` writes one JSON line per event to stdout/stderr, which shows in Hostinger's Node.js app logs.
- Events logged: `early_access` (outcome and source only), `rate_limited` (bucket), `db_error` (driver error code), `health_db_down`.
- **Never logged:** contact details, notes, IP addresses or request bodies.
- **Monitoring:** point an uptime checker at `GET /api/health`. It returns 200 when MySQL answers and 503 otherwise.

## 11. Design rules followed

- Secrets only in server environment variables. The only `NEXT_PUBLIC_` value is the public WhatsApp number.
- Every input validated on the server; the browser validation is for convenience only.
- No trust in client data beyond its validated shape. Batch counts are checked for consistency by Zod **and** by database CHECK constraints.
- Least privilege: the app's database user needs only `SELECT, INSERT, UPDATE, DELETE` at runtime. Migrations use `CREATE, ALTER, INDEX, DROP` as well; use a separate user for them if you like (see `docs/ENVIRONMENT_CONFIGURATION.md`).
- Duplicate requests are safe (upsert); the batch beacon is fire-and-forget, so a failure never affects the tool.

## 12. Tests (actual results, MariaDB 10.11.14, 18 Oct 2026)

| Suite | Command | Result |
|---|---|---|
| Unit + component | `npm test` | 41 passed |
| Database + API integration | `TEST_DATABASE_URL=… npm run test:db` | 21 passed |
| End-to-end incl. SEO + axe (desktop + phone, production build, real DB) | `npm run test:e2e` | 38 passed |

**Not yet verified:** running against Hostinger's actual MySQL server and its real version. Run `npm run db:verify` after the first migration there.

## 13. Not implemented (deferred until validation)

These are documented as future extensions in `docs/DATABASE_DESIGN.md` §9 and have no code:

- User accounts, sessions, email verification, password reset, account deletion
- Saved workflows and brand kits in the cloud
- Plans, subscriptions, usage quotas, credits
- Payments (Razorpay) and webhooks
- AI provider proxy (background removal / generation)
- Templates, an admin web UI, audit events

Building them requires: an auth library choice, a payment account, an AI provider contract and new migrations. They should be approved with evidence from the validation phase.

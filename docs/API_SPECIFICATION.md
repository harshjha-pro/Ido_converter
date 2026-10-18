# API specification

Base path `/api`. JSON only. Every response has `Cache-Control: no-store`.

**Success:** `{ "ok": true, "data": … }`
**Error:** `{ "ok": false, "error": { "code", "message", "fields"? }, "requestId" }`. Quote `requestId` when looking at logs.

| Status | `code` | Meaning |
|---|---|---|
| 400 | `invalid_json` | Body isn't valid JSON |
| 403 | `forbidden_origin` | Missing `Origin`, or not the site's own origin |
| 413 | `payload_too_large` | Body over 8 KB |
| 415 | `unsupported_media_type` | `Content-Type` isn't `application/json` |
| 422 | `validation_failed` | Field errors in `error.fields` |
| 429 | `rate_limited` | Too many requests; see the `Retry-After` header (seconds) |
| 503 | `service_unavailable` | Database or secret not configured |
| 503 | `database_unavailable` | Database unreachable or errored (details only in server logs) |

There are no authenticated endpoints. Everything is public and protected by origin checks, validation and rate limits.

---

## GET /api/health

Purpose: confirm the app can reach MySQL. No authentication or rate limit; runs `SELECT 1` only.

- `200` → `{ "ok": true, "data": { "status": "ok", "database": "up", "latencyMs": 3 } }`
- `503` → `service_unavailable` (not configured) or `database_unavailable`

Tests: `tests/integration/backend.test.ts` (up and down), `e2e/journeys.spec.ts`.

---

## POST /api/early-access

Purpose: record or refresh an early-access lead.

**Request** (schema `earlyAccessSchema` in `lib/validation.ts`; unknown fields are rejected):

| Field | Type | Rules |
|---|---|---|
| contact | string | Email, or Indian mobile (10 digits starting 6–9, optional +91/91/0), or `+` and 8–15 digits. Max 254. |
| role | `"seller" \| "cataloguer" \| "agency" \| "other"` | required |
| marketplaces | array of `"amazon" \| "flipkart" \| "meesho" \| "other"` | 1–4 items |
| monthlyPhotos | `"under_50" \| "50_200" \| "200_1000" \| "over_1000"` | required |
| note | string | optional, at most 500 characters |
| consent | `true` | must be exactly `true` |
| consentVersion | `"2026-10-18"` | must match the current consent text |
| source | `"home" \| "tool" \| "guide"` | required |
| website | string | honeypot; must be empty for real people |

**Responses:**
- `201 { "status": "created" }`: new lead
- `200 { "status": "updated" }`: the same contact (after normalisation) submitted again; answers updated, `submissions + 1`
- `202 { "status": "received" }`: honeypot filled; nothing stored (bots get no signal)
- Errors: 400, 403, 413, 415, 422, 429, 503

**Rate limit:** 5 requests per hour per hashed client IP.

**Database:** one `INSERT … ON DUPLICATE KEY UPDATE` on `early_access_leads`, plus counters in `rate_limits`.

**Security:**
- parameterised queries
- strict schema (no mass assignment)
- contact normalised before the uniqueness check
- the note is stored as text and never rendered as HTML by the app

**Tests:** created/updated, 8 concurrent duplicates → 1 row, 422 fields, honeypot, 403/415/413/400, SQL-injection text stored literally, 429 with `Retry-After`, 503 when down or unconfigured. Component and e2e tests cover the form.

---

## POST /api/events/batch

Purpose: store an anonymous summary after a batch finishes. Sent with `fetch(…, { keepalive: true })`; not sent when the browser signals Global Privacy Control. Failures are ignored by the tool.

**Request** (`batchEventSchema`, strict):

| Field | Type | Rules |
|---|---|---|
| presetKey | `"amazon" \| "flipkart" \| "meesho" \| "custom"` | |
| photoCount | integer | 1–100 |
| processedCount | integer | 0–100, ≤ photoCount |
| passCount, checkCount, failCount | integer | 0–100; their sum = processedCount |
| durationMs | integer | 0–3,600,000 |
| outputSize | integer | 500–5000 |
| deviceClass | `"mobile" \| "tablet" \| "desktop"` | |
| usedWorker, cancelled, usedSamples | boolean | |

**Responses:** `201 { "status": "recorded" }`, or 400/403/413/415/422/429/503.

**Rate limit:** 60 requests per hour per hashed client IP.

**Database:** one insert into `batch_events`; CHECK constraints repeat the count rules.

**Tests:** recorded row; inconsistent counts and extra fields (e.g. `fileName`) rejected; e2e confirms one row per real batch, and that the tool still works when this endpoint fails.

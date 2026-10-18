# Environment configuration

Set these in hPanel → your Node.js app → environment variables. Locally, copy `.env.example` to `.env.local`. Never commit real values.

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | for sign-ups and statistics | `mysql://u123_app:PASSWORD@localhost:3306/u123_idoconverter` | Runtime DB connection. Host is usually `localhost` on Hostinger. URL-encode special characters in the password. |
| `IP_HASH_SECRET` | with DATABASE_URL | output of `openssl rand -hex 32` | Key for anonymising client IPs (≥ 32 characters) |
| `APP_ORIGIN` | yes in production | `https://idoconverter.com` | Only origin allowed to POST to the API. Must match exactly (scheme, host, no trailing slash). |
| `DB_POOL_SIZE` | no | `3` | Connections per app process (1–10) |
| `CLIENT_IP_HEADER` | no | `x-forwarded-for` | Header carrying the visitor IP behind Hostinger's proxy |
| `NEXT_PUBLIC_SITE_URL` | yes in production | `https://idoconverter.com` | Canonical host for canonicals, sitemap, OG and JSON-LD. Built into the pages: set **before** `npm run build`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | `919876543210` | Shows WhatsApp links. Built into the pages, so set it **before** `npm run build`. |

**Without `DATABASE_URL`/`IP_HASH_SECRET`,** the whole site and tool still work. The sign-up form shows "This feature isn't available right now", and statistics are skipped.

## Database users (recommended)

- **Runtime** (`DATABASE_URL`): `SELECT, INSERT, UPDATE, DELETE` on the app database.
- **Migrations** (used only when running `npm run db:migrate`): adds `CREATE, ALTER, INDEX, DROP, REFERENCES`.

If hPanel only lets you create one user with all privileges, use it, and keep the credentials server-side.

## Checking the client IP header

After deploying, make two sign-ups from two different networks (Wi-Fi and mobile data), then run `SELECT bucket, COUNT(DISTINCT key_hash) FROM rate_limits GROUP BY bucket;`. Two different hashes mean the header works. One hash means every visitor is sharing a bucket: check which header Hostinger sets, and change `CLIENT_IP_HEADER`.

## Test-only variables

| Variable | Used by |
|---|---|
| `TEST_DATABASE_URL` | `npm run test:db`; the database name must end in `_test` (tables are dropped) |
| `E2E_BASE_URL`, `E2E_DATABASE_URL`, `PW_CHROMIUM_PATH` | `npm run test:e2e` |

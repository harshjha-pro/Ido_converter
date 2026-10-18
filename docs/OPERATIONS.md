# Operations: monitoring, logging, backup, rollback

- **Uptime:** point a free uptime monitor at `https://DOMAIN/api/health` (200 = app and DB up).
- **Logs:** hPanel → Node.js app logs. JSON lines: `early_access`, `rate_limited`, `client_ip_unknown`, `db_error`, `health_db_down`. They contain no personal data.
- **Watch for:** repeated `client_ip_unknown` (fix the header), bursts of `rate_limited` (abuse), `db_error` codes such as `ER_CON_COUNT_ERROR` (lower `DB_POOL_SIZE`).
- **Error tracking:** none configured. A hosted tracker can be added later; it must not capture request bodies.
- **Backups:** Hostinger's automatic backups, plus a manual phpMyAdmin export before migrations and monthly retention deletes. Test-restore into a scratch DB once.
- **Rollback (code):** redeploy the previous Git commit. Migrations are additive, so older code works with the newer schema.
- **Rollback (schema):** `database/rollback/*.down.sql` is destructive. Only with a backup and explicit owner approval.
- **Restore:** create an empty DB → import the backup → `npm run db:migrate` → `npm run db:verify` → point `DATABASE_URL` at it → restart.
- **Scaling triggers:** move off shared hosting only on evidence, such as sustained process or memory limits in hPanel, or server-side features (AI proxy, payments) needing background jobs.

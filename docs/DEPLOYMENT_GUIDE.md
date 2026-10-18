# Deployment guide (Hostinger Business, Node.js Web App + MySQL)

hPanel screens change; follow the current labels. Steps marked **verify** depend on your account.

## 1. Create the database

1. hPanel → Databases → MySQL: create a database and a user with a strong password. Note the host (usually `localhost`).
2. **Verify** the server version: in phpMyAdmin run `SELECT VERSION();`. You need MySQL 8.0.16+ or MariaDB 10.6+.

## 2. Run the migration

Pick one:

- **From your computer.** Enable Remote MySQL in hPanel for your IP only, then:
  ```bash
  DATABASE_URL="mysql://USER:PASS@REMOTE_HOST:3306/DBNAME" npm run db:migrate:dry
  DATABASE_URL="mysql://USER:PASS@REMOTE_HOST:3306/DBNAME" npm run db:migrate
  DATABASE_URL="mysql://USER:PASS@REMOTE_HOST:3306/DBNAME" npm run db:verify
  ```
  Remove the Remote MySQL rule afterwards.
- **Through SSH,** if your plan has it: run the same commands in the app folder with `localhost`.
- **phpMyAdmin.** Import `database/migrations/0001_initial_schema.sql`, then record it so the runner knows:
  ```sql
  CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY, checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  INSERT INTO schema_migrations (version, checksum) VALUES ('0001_initial_schema', '<sha256 of the file>');
  ```
  Get the checksum with `shasum -a 256 database/migrations/0001_initial_schema.sql`. Then paste `database/verification/schema_checks.sql`; every row should say `ok`.

## 3. Deploy the app

1. Push the project to GitHub. `.gitignore` excludes `node_modules`, `.next` and `.env*.local`.
2. hPanel → add a **Node.js Web App** from the repository. Choose Node.js **20 or newer** and the Next.js preset if offered.
3. Install `npm ci` (or `npm install`), build `npm run build`, start `npm start`.
4. Set the environment variables from `docs/ENVIRONMENT_CONFIGURATION.md`. Use `localhost` as the DB host here.
5. Deploy, then connect your domain and confirm HTTPS.

## 4. Check the deployment

- `https://YOUR_DOMAIN/api/health` → `{"ok":true,"data":{"status":"ok","database":"up",…}}`
- Pages load: `/`, `/product-photos`, `/photo-guide`, `/privacy`; an unknown path shows the 404 page.
- Submit the early-access form with your own email. The row should appear in phpMyAdmin.
- Process the sample photos. One `batch_events` row should appear with `used_samples = 1`.
- Do the client IP header check (ENVIRONMENT_CONFIGURATION.md).
- Watch resource usage in hPanel for a day.

## 5. Updating

1. Back up the database if the release adds migrations.
2. Run `npm run db:migrate` **before** deploying code that needs the new schema. Migrations are additive, so old code keeps working.
3. Deploy, then check `/api/health`.

## 6. If something breaks

- **Health returns 503:** check the env vars, the DB password URL-encoding, and that the host is `localhost`. Restart the app from hPanel.
- **Sign-ups return 403:** `APP_ORIGIN` doesn't exactly match the site's address (`https://` and `www` matter).
- **Roll back code:** redeploy the previous commit. Schema rollbacks in `database/rollback/` are destructive; use them only with a backup and a clear reason.

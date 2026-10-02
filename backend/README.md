# idoconverter account backend (Phase 4)

Accounts, paid plans (Razorpay) and opt-in saved history. **Completely separate from the free static site**: the tools never call this app, so if it is down or broken, every free tool keeps working.

> Plans, prices, features and the retention rule in `config/plans.php` are **placeholders** until the team confirms them (NOTES.md open questions 6–11). Do not take real payments before that, and get a security review first (see the security checklist in NOTES.md, prompt 28).

## Layout

```
backend/
  public/        ← web root (point the subdomain here). Pages, assets, webhook.
  src/           ← PHP code (outside the web root)
  config/        ← config.example.php (copy to config.php, git-ignored) and plans.php
  schema.sql     ← database tables
  cron/          ← cleanup.php: daily retention job
  bin/           ← make-admin.php: grant/revoke admin from the command line
  tests/         ← php tests/run.php (needs a MySQL/MariaDB test database)
```

## Set up on Hostinger

1. **Subdomain**: hPanel → Domains → Subdomains → create `account.YOUR-DOMAIN`. Upload the whole `backend/` folder next to `public_html` (e.g. `/home/USER/account/`) and set the subdomain's document root to `account/public`.
2. **Database**: hPanel → Databases → MySQL Databases → create a database and user. Open phpMyAdmin → Import → `schema.sql`.
3. **Config**: copy `config/config.example.php` to `config/config.php` and fill in:
   - `app_url`, `tools_url`
   - `db` → DSN, user, password from step 2
   - `razorpay` → **put your keys here** (only in this file, never in git):
     - `key_id`, `key_secret`: Razorpay Dashboard → Account & Settings → API Keys (start with **Test Mode** keys)
     - `webhook_secret`: Razorpay Dashboard → Webhooks → Add `https://account.YOUR-DOMAIN/webhook-razorpay.php`, events `payment.captured`, `payment.failed`, `order.paid`, choose a secret and paste it here
   - `environment` stays `production`
4. **SSL**: hPanel → Security → SSL for the subdomain. `public/.htaccess` forces HTTPS.
5. **Cron**: hPanel → Advanced → Cron Jobs → daily: `php /home/USER/account/cron/cleanup.php`
6. **First admin**: register on the site, then over SSH: `php /home/USER/account/bin/make-admin.php you@example.com`
7. **Test payments** in Razorpay Test Mode (test cards/UPI from Razorpay's docs). Switch to live keys only after the plans are confirmed and the security review is done.

Until real keys are set, `/plans.php` shows "Payments are not set up yet" and buying is disabled.

## How payment is verified

1. `checkout.php` creates a Razorpay order on the server; the amount comes from `config/plans.php`, never from the browser. A `payments` row is stored as `created`.
2. Razorpay Checkout collects the payment and returns order id, payment id and signature.
3. `payment-verify.php` checks the signature (HMAC-SHA256 with `key_secret`) **and** fetches the payment from Razorpay's API, requiring `captured`, the same order and the same amount. Only then is the plan activated.
4. `webhook-razorpay.php` receives Razorpay's signed notifications (HMAC-SHA256 of the raw body with `webhook_secret`) and activates the plan if step 3 did not (e.g. the user closed the tab). Duplicate events are ignored; activation is idempotent and row-locked.

Plans do not auto-renew (one-time payment per month/year). Card and UPI details never reach this server.

## Run the tests

```bash
# a throwaway MySQL/MariaDB database, e.g.:
mysql -e "CREATE DATABASE ido_test; CREATE USER 'ido'@'127.0.0.1' IDENTIFIED BY 'idotest'; GRANT ALL ON ido_test.* TO 'ido'@'127.0.0.1';"
php backend/tests/run.php
```

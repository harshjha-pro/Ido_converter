# Go live on Hostinger: step by step

For the owner. About 45–60 minutes. Hostinger's screens change sometimes: if a button has a slightly different name, pick the closest one. If you get stuck, send Claude a screenshot or the exact error text.

**Never paste passwords, `DATABASE_URL` or `IP_HASH_SECRET` into a chat.** Type them only into hPanel.

---

## Part A: Before you start

### Step 1. Create the support mailbox
1. hPanel → **Emails** → choose **idoconverter.com**.
2. **Create email account** → name `support` → set a password → **Create**.
3. ✅ You now have **support@idoconverter.com**. The website already shows this address on the Contact and Privacy pages, so it must exist before launch.

### Step 2. Make sure GitHub has the new website on `main`
Your GitHub repository's `main` branch still holds the **old** website. All the new work is on the branch `claude/youthful-sagan-ofwafc`.
- **Easiest:** ask Claude to "open a pull request to main". Then on GitHub, open the pull request and click **Merge pull request**. Hostinger then deploys `main`.
- **Or:** in Step 6, choose the branch `claude/youthful-sagan-ofwafc` if Hostinger lets you pick a branch.

⚠️ Don't deploy `main` before it's merged: you'd put the old site live.

---

## Part B: Database (about 10 minutes)

### Step 3. Create the database
1. hPanel → **Databases** → **Management** (or "MySQL Databases").
2. Database name: `idoconv`. User name: `idoconv`. Password: use a password generator and make it **only letters and numbers, 24+ characters** (special characters need extra encoding later).
3. Click **Create**.
4. ✅ Hostinger adds a prefix, so you'll see names like `u123456789_idoconv`. **Write down** the full database name, full user name and password somewhere safe (not in chat).

### Step 4. Create the tables (one file)
1. On GitHub, open `database/hostinger_setup.sql` in the repository → **Download raw file**.
2. hPanel → Databases → **phpMyAdmin** → **Enter phpMyAdmin** for `u123456789_idoconv`.
3. Click the **Import** tab → **Choose file** → pick `hostinger_setup.sql` → scroll down → **Import** (or **Go**).
4. ✅ You should see "Import has been successfully finished". On the left, the database now has **4 tables**: `batch_events`, `early_access_leads`, `rate_limits`, `schema_migrations`.

### Step 5. Note the database version
1. In phpMyAdmin, click the **SQL** tab, type `SELECT VERSION();` and click **Go**.
2. ✅ Write down the result (for example `10.11.x-MariaDB` or `8.0.x`) and send it to Claude. MySQL 8.0.16+ or MariaDB 10.6+ is needed.

---

## Part C: The app (about 15 minutes)

### Step 6. Add the Node.js app
1. hPanel → **Websites** → **Add website** → **Node.js Web App**.
2. **Import Git repository** → connect GitHub → allow the Hostinger GitHub app to see `Ido_converter`.
3. Choose repository **harshjha-pro/Ido_converter** and the branch from Step 2.
4. Framework: **Next.js** (it should be detected automatically).
5. Node.js version: **20** or **22**. Build command: `npm run build`. Start command: `npm start`. Leave the root directory as it is.
6. When asked for a domain, choose **idoconverter.com**.

### Step 7. Add the environment variables (before the first deploy)
Find **Environment variables** in the app's settings and add these, one per line:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://idoconverter.com` |
| `APP_ORIGIN` | `https://idoconverter.com` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@idoconverter.com` |
| `DATABASE_URL` | `mysql://USER:PASSWORD@localhost:3306/DBNAME` using the full names and password from Step 3 |
| `IP_HASH_SECRET` | 40 or more random letters and numbers from a password generator. Keep it secret; never change it later |

Example shape only (not real values): `mysql://u123456789_idoconv:Abc123Xyz...@localhost:3306/u123456789_idoconv`.

### Step 8. Deploy
1. Click **Deploy**. The first build takes a few minutes.
2. ✅ The deployment shows **Success**. If it fails, copy the last 20 lines of the build log and send them to Claude.

### Step 9. Domain and HTTPS
1. Make sure **idoconverter.com** points to this app and **SSL** is on (hPanel → Security → SSL, if it isn't automatic).
2. In the domain settings, redirect **www.idoconverter.com** → `https://idoconverter.com` (301, permanent).

---

## Part D: Check it works (about 10 minutes)

| Open this | You should see |
|---|---|
| `https://idoconverter.com/api/health` | Text containing `"status":"ok"` and `"database":"up"` |
| `https://idoconverter.com` | The homepage, with the padlock in the address bar |
| `https://www.idoconverter.com` | It jumps to `https://idoconverter.com` |
| Product photos → **Try 4 sample photos** → **Process 4 photos** → **Download ZIP** | A ZIP downloads with photos and `report.csv` |
| Templates → any template → **Download PNG** | An image downloads |
| Homepage → early-access form → your own email → **Join early access** | "You're on the list" |
| phpMyAdmin → `early_access_leads` table | Your sign-up is there |
| `https://idoconverter.com/sitemap.xml` | A list of `https://idoconverter.com/...` pages |
| `https://idoconverter.com/no-such-page` | The "This page doesn't exist" page |

**Send Claude:** the database version (Step 5), the Node.js version you chose, a screenshot of `/api/health`, and anything that didn't match the table.

Then Claude will check the security headers from outside and guide the remaining checks (`docs/RELEASE_CHECKLIST.md`).

---

## If something goes wrong

| Problem | What to do |
|---|---|
| `/api/health` says `"database":"down"` or shows 503 | Check `DATABASE_URL`: full user name, full database name, `localhost`, and the password (letters and numbers only). Then **Redeploy**. |
| The early-access form says "This feature isn't available right now" | Same as above: the database settings are missing or wrong. |
| The form says something went wrong / 403 | `APP_ORIGIN` must be exactly `https://idoconverter.com`, with no slash at the end. |
| Links or the sitemap show the wrong address | `NEXT_PUBLIC_SITE_URL` was wrong when the site was built. Fix it and **Redeploy** (it's built into the pages). |
| The old website appears | Hostinger deployed `main` before the merge. Do Step 2, then redeploy. |
| Build fails with "out of memory" | Send Claude the log; the build may need a retry or a smaller setting. |

## Updating later
When Claude pushes new work: merge it into `main` on GitHub (or redeploy the branch) and click **Redeploy** in hPanel. If an update adds a database change, Claude will give you a new SQL file to import first.

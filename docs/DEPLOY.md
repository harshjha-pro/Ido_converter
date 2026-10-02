# Deploying idoconverter

Hosting: **Hostinger shared hosting** (decided in NOTES.md, open question 4). Claude never deploys; a person runs these steps.

## 1. Build on your computer

```bash
npm ci                                     # exact dependency versions
npm test                                   # all tests must pass
SITE_URL=https://YOUR-DOMAIN npm run build # e.g. https://idoconverter.com (open question 21)
```

Windows PowerShell: `$env:SITE_URL="https://YOUR-DOMAIN"; npm run build`

The build writes the whole site to `dist/`. Check that it contains `index.html`, `404.html`, `contact.php`, `.htaccess` (hidden file), `sitemap.xml`, `robots.txt`, `favicon.svg` and the `_astro/` folder.

## 2. Make a dated zip

```bash
cd dist && zip -r ../idoconverter-$(date +%F).zip . && cd ..
```

Zip the **contents** of `dist/` (so `index.html` is at the top of the zip) and make sure `.htaccess` is included (`unzip -l idoconverter-*.zip | grep htaccess`). Keep every zip: it is your rollback copy.

## 3. Upload to Hostinger

**Option A: hPanel File Manager (no SSH)**
1. hPanel → Websites → your site → **File Manager** → open `public_html`.
2. First deploy only: delete Hostinger's default `default.php` / placeholder files.
3. Later deploys: select everything in `public_html` → **Compress** → name it `backup-YYYY-MM-DD.zip` and download it (rollback copy), then delete the old site files (not the backup).
4. **Upload** `idoconverter-YYYY-MM-DD.zip` into `public_html` → right-click → **Extract** → then delete the uploaded zip.
5. Turn on "Show hidden files" and confirm `.htaccess` is in `public_html`.

**Option B: SSH (if enabled in hPanel → Advanced → SSH Access)**
```bash
rsync -avz --delete dist/ USER@HOST:public_html/ -e "ssh -p PORT"
```
(`--delete` removes files that are no longer in the build. Take a backup first: `ssh -p PORT USER@HOST "cd public_html && zip -r ~/backup-$(date +%F).zip ."`)

## 4. HTTPS and email

1. hPanel → **Security → SSL**: install the free SSL certificate for the domain (and `www`). The `.htaccess` redirects all HTTP to HTTPS.
2. The contact form uses PHP `mail()`. For reliable delivery create a mailbox or forwarder for `no-reply@YOUR-DOMAIN` in hPanel → Emails (Hostinger may reject From addresses outside your domain). Messages go to myselfhkjha@gmail.com (set in `website/public/contact.php`).

## 5. Check the live site

- `https://YOUR-DOMAIN/` loads; `http://` redirects to `https://`.
- Open a tool, press F12 → **Network**, run the tool: no request should appear after the page loads.
- F12 → Console: no errors (a CSP error means something tried to load from elsewhere: report it).
- Response headers of any page include `Content-Security-Policy` with `connect-src 'none'`.
- `https://YOUR-DOMAIN/does-not-exist` shows the idoconverter 404 page.
- Send a test message from `/contact/` and check it arrives.
- `https://YOUR-DOMAIN/sitemap.xml` lists only real pages with your domain.
- Submit the sitemap in Google Search Console.

## 6. Roll back

Delete the current files in `public_html`, upload the previous `idoconverter-YYYY-MM-DD.zip` (or the `backup-…zip`) and extract it.

## Cloudflare Pages (fallback only)

Build command `npm run build`, output directory `dist`, environment variable `SITE_URL`. Note: Cloudflare ignores `.htaccess` (security headers would need a `_headers` file) and cannot run `contact.php` (the contact form would need another handler). Ask Claude to prepare both if you switch.

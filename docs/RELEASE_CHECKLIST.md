# Release and regression checklist

## Before each release
- [ ] `npm ci` passes on **npm 10** (the version Hostinger may use)
- [ ] `npm ci && npm run typecheck && npm run lint && npm test && npm run build`
- [ ] `npm run test:db` against a `_test` database
- [ ] `npm run test:e2e` against the production build (desktop + phone)
- [ ] `npm audit --omit=dev` shows 0; review any dev advisories
- [ ] CHANGELOG, KNOWN_ISSUES and FEATURE_CATALOG updated
- [ ] New migrations: back up the DB, `db:migrate:dry`, then `db:migrate`, then `db:verify`

## Manual regression (≈15 minutes)
- [ ] Real phone (Android Chrome): sample photos → process → open a result → download ZIP → open the ZIP
- [ ] iPhone Safari: same, plus the converter to WebP (expect a "saved as PNG" note on older iOS)
- [ ] Converter: rotate 90° + longest side 500 → the downloaded file is 250×500 (for a 2:1 landscape input)
- [ ] Keyboard only: menu, drop zone (Enter opens the picker), presets, Process, inspector (Escape closes)
- [ ] Early-access form: an error shows → fix it → success; the row appears in the DB
- [ ] `/api/health` is green; `/robots.txt` and `/sitemap.xml` use the production domain
- [ ] Dark mode on one page
- [ ] Privacy page still matches what is collected

## After deploy (smoke)
- [ ] Health is green; home, tools, guide, privacy, terms return 200; a random path returns 404
- [ ] One real sign-up and one real batch appear in the DB
- [ ] Logs show no `client_ip_unknown` warnings (otherwise fix `CLIENT_IP_HEADER`)

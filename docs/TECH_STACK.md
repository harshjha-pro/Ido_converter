# Technology stack

_Versions are exact pins from `package.json`. Each release was at least 14 days old when chosen, to reduce supply-chain risk._

## 1. Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js (App Router) | 15.5.27 | Routing, static generation, server route handlers |
| React / React DOM | 19.2.8 | UI |
| TypeScript | 5.9.3 | Types across browser and server |
| CSS Modules + CSS variables | built into Next.js | Styling with the `docs/DESIGN.md` tokens |
| Web Workers, OffscreenCanvas, createImageBitmap | browser APIs | Image processing off the main thread |

**Tailwind CSS is not used.** The working UI is built with CSS Modules mapped one-to-one to the design tokens. Migrating would add a dependency and rewrite every component without improving what users see. If you still want Tailwind, it can be added later with the tokens exposed as Tailwind theme values; it's a stack change to approve explicitly.

## 2. Backend runtime

Node.js 20+ (tested on 22), Next.js route handlers with `runtime = "nodejs"`, run by `next start` as a Hostinger Node.js Web App.

## 3. Database

MySQL as provided by Hostinger hPanel. Hostinger's own documentation states that only MySQL is supported on shared and managed hosting, so PostgreSQL was not used. SQL is written for the common subset of **MySQL 8.0.16+** and **MariaDB 10.6+** (CHECK constraints are enforced from those versions). Tested on MariaDB 10.11.14.

## 4. ORM and migrations

| Item | Choice |
|---|---|
| Driver | mysql2 3.24.5 (promise API, pooled) |
| ORM | Drizzle ORM 0.45.3, `mysql-core` dialect, used for typed queries |
| Migrations | Hand-written SQL in `database/migrations`, applied in order by `scripts/db-migrate.mjs` with SHA-256 checksums in `schema_migrations` |

Why not drizzle-kit migrations: its generated files contain `--> statement-breakpoint` markers that MySQL doesn't accept as comments, so they can't be imported into phpMyAdmin. Plain SQL can be reviewed and imported directly. A test keeps the Drizzle models and the migrated schema identical.

## 5. Authentication

None in the MVP (no accounts). See `backend.md` §6.

## 6. Files and storage

All image work happens in the browser; outputs download directly. No uploads, object storage or server-side image processing.

## 7. External APIs

None connected.

## 8. Validation and security

- Zod 4.6.5: shared schemas, strict objects, used on both sides
- Node `crypto`: HMAC-SHA256 for anonymised rate-limit keys
- Security headers in `next.config.mjs`; Content-Security-Policy with a per-request nonce in `middleware.ts` (`lib/csp.ts`)
- Same-origin checks, body limits, honeypot (see `docs/BACKEND_SECURITY.md`)

## 9. Testing

| Tool | Version | Use |
|---|---|---|
| Vitest | 4.1.11 | Unit and integration tests (versions before 4.1.11 have published advisories) |
| React Testing Library + jsdom | 16.3.3 / 26.1.0 | Component tests |
| Playwright Test | 1.56.1 | End-to-end tests, desktop and phone |
| @axe-core/playwright | 4.13.0 | Automated WCAG 2.2 AA rule checks in e2e |
| ESLint + eslint-config-next | 9.39.5 / 15.5.27 | Linting (Next.js core-web-vitals + TypeScript rules) |

## 10. SEO

Static HTML for every page; `lib/seo.ts` gives every page a title, description, canonical URL and sharing tags; `app/robots.ts` and `app/sitemap.ts`; JSON-LD (WebSite, Organization, WebApplication, BreadcrumbList). See `docs/TECHNICAL_SEO.md`.

## 11. Hosting requirements

Hostinger Business Web Hosting, using its Node.js Web App and MySQL database. Node.js 20 or newer. See `docs/DEPLOYMENT_GUIDE.md`.

## 12. Alternatives considered

| Option | Why not (now) |
|---|---|
| PostgreSQL (managed, e.g. Supabase or Neon) | Extra cost and a second provider; Hostinger's MySQL is included and sufficient |
| SQLite | Data lives on the app's disk; unsafe across redeploys on shared hosting |
| Redis for rate limiting | Not available on shared hosting; MySQL counters are enough at this scale |
| drizzle-kit migrations | Output isn't importable into phpMyAdmin (see §4) |
| Tailwind CSS | Rewrite of a working, token-based system (see §1) |
| An auth provider | No accounts in the MVP |

## 13. Known risks and limitations

- **Hostinger's exact MySQL/MariaDB version is unverified.** Run `npm run db:verify`; it checks the version.
- **Process limits on shared hosting.** The 3-connection pool and static pages keep usage low.
- **Client IP header.** Rate limiting assumes `X-Forwarded-For`. If Hostinger uses another header, every visitor shares one bucket; see `docs/ENVIRONMENT_CONFIGURATION.md`.
- **npm 10 resolver bug.** The lockfile was produced with npm 11 because npm 10.9 crashes resolving Vitest 4's optional peers. `npm ci` with npm 10 installs it correctly (tested).
- **Dependency audit:** production 0 known vulnerabilities on 18 Oct 2026 (PostCSS override 8.5.28 pinned). Dev-only: a `braces` advisory via eslint-config-next has no patched release; accepted (THREAT_MODEL S9).

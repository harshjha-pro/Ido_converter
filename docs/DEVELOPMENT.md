# Development guide

_Covers development setup, coding standards, dependency policy and contributing._

## Setup
```bash
node --version        # 20+
npm ci
cp .env.example .env.local    # database optional; tools work without it
npm run dev           # http://localhost:3000
```
Optional local database: MySQL 8 / MariaDB 10.6+. Create `x_dev` and `x_test` databases, then `npm run db:migrate`. See `database/README.md`.

## Commands
| Purpose | Command |
|---|---|
| Types | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit + component tests | `npm test` |
| DB + API tests | `TEST_DATABASE_URL=mysql://…/x_test npm run test:db` |
| E2E, SEO and accessibility | build, `npm start`, then `E2E_BASE_URL=http://localhost:3000 E2E_DATABASE_URL=… npm run test:e2e` |
| Build | `npm run build` |

## Coding standards
- TypeScript strict; no `any` in new code; validate all external input with Zod (`lib/validation.ts`).
- Processing logic lives in `lib/image` (no React); server code in `lib/server`, never imported by `"use client"` files.
- Colours, spacing and radii come only from the `docs/DESIGN.md` tokens. One primary button per section.
- Every visible control does something real, and has a test or a manual check in RELEASE_CHECKLIST.md.
- User-facing claims must match behaviour (CONTENT_STYLE_GUIDE.md).
- No `console.log` in app code. Use `lib/server/log.ts` server-side, and never log personal data.

## Dependency policy
- New dependencies need a reason recorded in `docs/TECH_STACK.md` and owner approval.
- Pin exact versions; choose releases at least 14 days old; run `npm audit` (production must be 0) before merging.
- Prefer platform APIs and small in-repo code over libraries for small jobs (the ZIP writer, for example).
- If npm 10's resolver crashes when adding a dependency, add it with `npx npm@11 install …`, then **always** run `npm install --package-lock-only` with npm 10 and check that `npm ci` passes on npm 10. npm 11 can leave out optional entries that npm 10's `npm ci` requires, which would break deployment on Hostinger.

## Contributing
1. Branch, make a small focused change, and add or adjust tests.
2. Run typecheck, lint, unit, DB and e2e tests, then build.
3. Update the affected docs (FEATURE_CATALOG status, CHANGELOG, KNOWN_ISSUES).
4. Never commit `.env.local`, exports or customer data.

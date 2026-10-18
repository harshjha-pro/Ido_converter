# database/

Engine: MySQL 8.0.16+ / MariaDB 10.6+ (Hostinger MySQL). Design: `docs/DATABASE_DESIGN.md`.

| Folder | Contents | Runs automatically? |
|---|---|---|
| `migrations/` | Ordered schema changes. **Never edit after applying**; add a new file. | `npm run db:migrate` |
| `rollback/` | Destructive reversals, one per migration | Never. Manual only, with approval and a backup. |
| `seeds/` | Fake development data | `npm run db:seed` (refuses unless the DB name ends in `_dev`/`_test`) |
| `queries/` | Reports (`validation_metrics.sql`), retention, deletion requests | Manual |
| `verification/` | Read-only schema checks | `npm run db:verify` |

## Commands

```bash
npm run db:migrate:dry   # list pending migrations
npm run db:migrate       # apply pending migrations, record checksums
npm run db:verify        # every check must print ✓
npm run db:seed          # dev/test databases only
npm run leads:export > leads.csv
```

Scripts read `DATABASE_URL` from the environment or `.env.local`.

## Verified (18 Oct 2026, MariaDB 10.11.14)

- `0001_initial_schema` applied to an empty database, re-run as a no-op, and an edited copy was refused.
- `db:verify`: 13/13 checks passed (version, 4 tables InnoDB/utf8mb4, 6 indexes, 12 CHECK constraints, migration recorded).
- The integration suite (`npm run test:db`) confirms the constraints, the uniqueness and concurrency behaviour, and that the Drizzle models match the tables.

**Not yet run on Hostinger's MySQL.** Do that with `db:migrate:dry`, then `db:migrate`, then `db:verify`.

## Adding a migration

1. Create `migrations/0002_short_name.sql` using syntax valid on both MySQL 8 and MariaDB 10.6. Avoid JSON columns, `RETURNING` and generated invisible columns.
2. Write the matching `rollback/0002_short_name.down.sql`.
3. Update `lib/server/db/schema.ts` and `docs/DATABASE_DESIGN.md`.
4. Run `npm run test:db`. The consistency test fails if the model and SQL differ.

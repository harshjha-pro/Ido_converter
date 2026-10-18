#!/usr/bin/env node
// Applies database/migrations/*.sql in filename order, once each.
// Usage: node scripts/db-migrate.mjs [--dry-run] [--dir database/migrations]
// Records version + SHA-256 in schema_migrations; refuses to continue if an applied file was edited.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { connect } from "./_db.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dirArg = args.indexOf("--dir");
const dir = path.resolve(dirArg >= 0 ? args[dirArg + 1] : "database/migrations");

const files = fs.readdirSync(dir).filter(f => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort();
const conn = await connect({ multipleStatements: true });
try {
  await conn.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    checksum CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (version)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const [rows] = await conn.query("SELECT version, checksum FROM schema_migrations");
  const applied = new Map(rows.map(r => [r.version, r.checksum]));
  let ran = 0;
  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const sum = crypto.createHash("sha256").update(sql).digest("hex");
    if (applied.has(version)) {
      if (applied.get(version) !== sum) {
        console.error(`✗ ${file} was changed after it was applied. Create a new migration instead of editing it.`);
        process.exitCode = 1; break;
      }
      console.log(`· ${file} already applied`);
      continue;
    }
    if (dryRun) { console.log(`→ would apply ${file}`); continue; }
    console.log(`→ applying ${file}`);
    await conn.query(sql);
    await conn.execute("INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)", [version, sum]);
    ran++;
  }
  if (!process.exitCode) console.log(dryRun ? "Dry run complete." : `Done. ${ran} migration(s) applied.`);
} catch (err) {
  console.error(`✗ Migration failed: ${err.code ?? ""} ${err.message}`);
  console.error("DDL commits immediately in MySQL/MariaDB. Fix the cause and re-run: CREATE ... IF NOT EXISTS makes 0001 re-runnable.");
  process.exitCode = 1;
} finally {
  await conn.end();
}

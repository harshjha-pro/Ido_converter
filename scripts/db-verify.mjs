#!/usr/bin/env node
// Runs database/verification/schema_checks.sql and exits non-zero if any check fails.
import fs from "node:fs";
import { connect } from "./_db.mjs";

const conn = await connect();
try {
  const sql = fs.readFileSync("database/verification/schema_checks.sql", "utf8").replace(/^\s*--.*$/gm, "").trim().replace(/;\s*$/, "");
  const [rows] = await conn.query(sql);
  let failed = 0;
  for (const r of rows) {
    const okRow = r.status === "ok";
    if (!okRow) failed++;
    console.log(`${okRow ? "✓" : "✗"} ${r.check_name}: ${r.detail} ${okRow ? "" : `(${r.status})`}`);
  }
  console.log(failed ? `${failed} check(s) failed.` : "All checks passed.");
  process.exitCode = failed ? 1 : 0;
} finally {
  await conn.end();
}

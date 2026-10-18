#!/usr/bin/env node
// Prints early-access leads as CSV (UTF-8 with BOM, opens in Excel). There is deliberately no admin web page.
// Usage: node scripts/leads-export.mjs > leads.csv   — keep the file private and delete it when done.
import { connect } from "./_db.mjs";

process.stdout.on("error", e => { if (e.code === "EPIPE") process.exit(0); throw e; });
const conn = await connect();
try {
  const [rows] = await conn.query(`SELECT contact_type, contact_value, role, sells_amazon, sells_flipkart, sells_meesho, sells_other,
    monthly_photos, note, source, submissions, created_at, updated_at FROM early_access_leads ORDER BY created_at`);
  const cols = ["contact_type","contact_value","role","sells_amazon","sells_flipkart","sells_meesho","sells_other","monthly_photos","note","source","submissions","created_at","updated_at"];
  const cell = v => {
    let t = v instanceof Date ? v.toISOString() : String(v ?? "");
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // stop spreadsheet formula injection
    return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  process.stdout.write("\uFEFF" + cols.join(",") + "\r\n");
  for (const r of rows) process.stdout.write(cols.map(c => cell(r[c])).join(",") + "\r\n");
  console.error(`${rows.length} lead(s) exported.`);
} finally {
  await conn.end();
}

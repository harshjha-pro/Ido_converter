// Shared helpers for database scripts. Reads DATABASE_URL from the environment (or .env.local).
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

export function loadEnvFile() {
  for (const f of [".env.local", ".env"]) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

export async function connect({ multipleStatements = false } = {}) {
  loadEnvFile();
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("mysql://")) {
    console.error("DATABASE_URL is missing or doesn't start with mysql://");
    process.exit(2);
  }
  return mysql.createConnection({ uri: url, multipleStatements, timezone: "Z", charset: "utf8mb4_unicode_ci" });
}

export function dbName(url = process.env.DATABASE_URL ?? "") {
  try { return new URL(url).pathname.replace(/^\//, ""); } catch { return ""; }
}

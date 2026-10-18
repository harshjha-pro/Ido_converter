/**
 * Runs against a real MySQL/MariaDB test database.
 * TEST_DATABASE_URL=mysql://user:pass@host:3306/<name ending in _test> npm run test:db
 * The suite drops and recreates its own tables, so it refuses any database not ending in _test.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import mysql, { type Connection, type RowDataPacket } from "mysql2/promise";
import { getTableConfig } from "drizzle-orm/mysql-core";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { SCHEMA_TABLES } from "@/lib/server/db/schema";
import { closeDb } from "@/lib/server/db/client";
import { resetEnvCache } from "@/lib/server/env";
import { handleBatchEvent, handleEarlyAccess, handleHealth } from "@/lib/server/handlers";
import { CONSENT_VERSION } from "@/lib/validation";

const URL_ = process.env.TEST_DATABASE_URL ?? "";
const dbName = (() => { try { return new URL(URL_).pathname.slice(1); } catch { return ""; } })();
const enabled = /_test$/.test(dbName);
const ORIGIN = "http://localhost:3100";
let conn: Connection;

function useEnv(over: Record<string, string | undefined> = {}) {
  Object.assign(process.env, { DATABASE_URL: URL_, IP_HASH_SECRET: "t".repeat(40), APP_ORIGIN: ORIGIN, NODE_ENV: "test" }, over);
  for (const [k, v] of Object.entries(over)) if (v === undefined) delete process.env[k];
  resetEnvCache();
}
function migrate(dir?: string) {
  return spawnSync("node", ["scripts/db-migrate.mjs", ...(dir ? ["--dir", dir] : [])], { env: { ...process.env, DATABASE_URL: URL_ }, encoding: "utf8" });
}
function post(url: string, body: unknown, opts: { ip?: string; origin?: string | null; type?: string; raw?: string } = {}) {
  const headers: Record<string, string> = { "content-type": opts.type ?? "application/json", "x-forwarded-for": opts.ip ?? "198.51.100.1" };
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  return new Request(`${ORIGIN}${url}`, { method: "POST", headers, body: opts.raw ?? JSON.stringify(body) });
}
const lead = (over: Record<string, unknown> = {}) => ({ contact: "seller@example.com", role: "seller", marketplaces: ["amazon", "meesho"], monthlyPhotos: "50_200", consent: true, consentVersion: CONSENT_VERSION, source: "home", ...over });
const batch = (over: Record<string, unknown> = {}) => ({ presetKey: "amazon", photoCount: 10, processedCount: 10, passCount: 7, checkCount: 2, failCount: 1, durationMs: 4200, outputSize: 1600, deviceClass: "mobile", usedWorker: true, cancelled: false, usedSamples: false, ...over });
const rows = async (sql: string, p: unknown[] = []) => (await conn.query<RowDataPacket[]>(sql, p))[0];

describe.skipIf(!enabled)("database + API (integration)", () => {
  beforeAll(async () => {
    conn = await mysql.createConnection({ uri: URL_, timezone: "Z" });
    for (const t of ["rate_limits", "batch_events", "early_access_leads", "schema_migrations"]) await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
  });
  afterAll(async () => { await closeDb(); await conn?.end(); });
  beforeEach(async () => { await closeDb(); useEnv(); });

  describe("migrations", () => {
    it("apply to an empty database, then re-run as a no-op", () => {
      const first = migrate();
      expect(first.status, first.stderr).toBe(0);
      expect(first.stdout).toMatch(/1 migration\(s\) applied/);
      const second = migrate();
      expect(second.status).toBe(0);
      expect(second.stdout).toMatch(/already applied/);
    });
    it("pass every verification check", () => {
      const out = execFileSync("node", ["scripts/db-verify.mjs"], { env: { ...process.env, DATABASE_URL: URL_ }, encoding: "utf8" });
      expect(out).toMatch(/All checks passed/);
    });
    it("refuse to continue when an applied migration was edited", () => {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mig-"));
      const src = fs.readFileSync("database/migrations/0001_initial_schema.sql", "utf8");
      fs.writeFileSync(path.join(tmp, "0001_initial_schema.sql"), src + "\n-- edited\n");
      const r = migrate(tmp);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/was changed after it was applied/);
    });
  });

  describe("schema consistency (SQL migrations ↔ Drizzle models)", () => {
    const sqlType = (c: { getSQLType(): string; columnType: string }) => {
      const t = c.getSQLType().toLowerCase();
      return t === "boolean" ? "tinyint(1)" : t;
    };
    for (const [table, model] of Object.entries(SCHEMA_TABLES)) {
      it(`${table} columns match`, async () => {
        const cfg = getTableConfig(model);
        const cols = await rows("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION", [table]);
        expect(cols.map(c => c.COLUMN_NAME).sort()).toEqual(cfg.columns.map(c => c.name).sort());
        for (const c of cfg.columns) {
          const db = cols.find(x => x.COLUMN_NAME === c.name)!;
          // MariaDB and MySQL < 8.0.19 report integer display widths (bigint(20)); MySQL 8 doesn't. tinyint(1) means boolean, so keep it.
          const dbType = String(db.COLUMN_TYPE).toLowerCase().replace(/ unsigned$/, "").replace(/^(bigint|int|smallint|mediumint)\(\d+\)$/, "$1");
          const unsigned = String(db.COLUMN_TYPE).toLowerCase().endsWith("unsigned");
          expect(dbType, `${table}.${c.name} type`).toBe(sqlType(c as never).replace(/ unsigned$/, ""));
          expect(unsigned, `${table}.${c.name} unsigned`).toBe(c.getSQLType().toLowerCase().endsWith("unsigned"));
          expect(db.IS_NULLABLE === "NO", `${table}.${c.name} nullability`).toBe(c.notNull);
        }
      });
    }
  });

  describe("constraints", () => {
    it("reject batch counts that don't add up", async () => {
      await expect(conn.query("INSERT INTO batch_events (preset_key, photo_count, processed_count, pass_count, check_count, fail_count, duration_ms, output_size, device_class, used_worker, cancelled) VALUES ('amazon', 5, 5, 1, 1, 1, 10, 1600, 'mobile', 1, 0)"))
        .rejects.toThrow(/CONSTRAINT|check/i);
    });
    it("reject leads with no marketplace and duplicate contacts", async () => {
      await expect(conn.query("INSERT INTO early_access_leads (contact_type, contact_value, role, monthly_photos, source, consent_version, consent_at) VALUES ('email', 'none@example.com', 'seller', 'under_50', 'home', 'x', UTC_TIMESTAMP(3))"))
        .rejects.toThrow(/CONSTRAINT|check/i);
      await conn.query("INSERT INTO early_access_leads (contact_type, contact_value, role, sells_amazon, monthly_photos, source, consent_version, consent_at) VALUES ('email', 'dup@example.com', 'seller', 1, 'under_50', 'home', 'x', UTC_TIMESTAMP(3))");
      await expect(conn.query("INSERT INTO early_access_leads (contact_type, contact_value, role, sells_amazon, monthly_photos, source, consent_version, consent_at) VALUES ('email', 'DUP@example.com', 'seller', 1, 'under_50', 'home', 'x', UTC_TIMESTAMP(3))"))
        .rejects.toThrow(/Duplicate/i);
      await conn.query("DELETE FROM early_access_leads");
    });
  });

  describe("POST /api/early-access", () => {
    beforeEach(async () => { await conn.query("DELETE FROM early_access_leads"); await conn.query("DELETE FROM rate_limits"); });

    it("creates a lead (201) and updates it on resubmission (200) without duplicating", async () => {
      const a = await handleEarlyAccess(post("/api/early-access", lead({ contact: "98765 43210" })));
      expect(a.status).toBe(201);
      expect(await a.json()).toEqual({ ok: true, data: { status: "created" } });
      const b = await handleEarlyAccess(post("/api/early-access", lead({ contact: "+91-98765-43210", role: "cataloguer", marketplaces: ["flipkart"] }), { ip: "198.51.100.2" }));
      expect(b.status).toBe(200);
      const r = await rows("SELECT contact_value, role, sells_amazon, sells_flipkart, submissions FROM early_access_leads");
      expect(r).toHaveLength(1);
      expect(r[0]).toMatchObject({ contact_value: "+919876543210", role: "cataloguer", sells_amazon: 0, sells_flipkart: 1, submissions: 2 });
    });

    it("stays idempotent under concurrent duplicate submissions", async () => {
      const res = await Promise.all(Array.from({ length: 8 }, (_, i) => handleEarlyAccess(post("/api/early-access", lead(), { ip: `198.51.100.${10 + i}` }))));
      expect(res.every(r => r.status === 201 || r.status === 200)).toBe(true);
      const r = await rows("SELECT COUNT(*) AS n, MAX(submissions) AS s FROM early_access_leads");
      expect(Number(r[0].n)).toBe(1);
      expect(Number(r[0].s)).toBe(8);
    });

    it("returns 422 with field errors for invalid input", async () => {
      const res = await handleEarlyAccess(post("/api/early-access", lead({ contact: "nope", consent: false })));
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.error.code).toBe("validation_failed");
      expect(Object.keys(body.error.fields)).toEqual(expect.arrayContaining(["contact", "consent"]));
      expect(body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("accepts but discards honeypot submissions (202)", async () => {
      const res = await handleEarlyAccess(post("/api/early-access", lead({ website: "http://spam.example" })));
      expect(res.status).toBe(202);
      expect((await rows("SELECT COUNT(*) AS n FROM early_access_leads"))[0].n).toBe(0);
    });

    it("rejects cross-site, non-JSON, oversized and malformed requests", async () => {
      expect((await handleEarlyAccess(post("/api/early-access", lead(), { origin: "https://evil.example" }))).status).toBe(403);
      expect((await handleEarlyAccess(post("/api/early-access", lead(), { origin: null }))).status).toBe(403);
      expect((await handleEarlyAccess(post("/api/early-access", lead(), { type: "text/plain" }))).status).toBe(415);
      expect((await handleEarlyAccess(post("/api/early-access", null, { raw: JSON.stringify(lead({ note: "x".repeat(9000) })) }))).status).toBe(413);
      expect((await handleEarlyAccess(post("/api/early-access", null, { raw: "{not json" }))).status).toBe(400);
    });

    it("stores SQL-looking input literally (parameterised queries)", async () => {
      const evil = "'); DROP TABLE early_access_leads; -- \" OR 1=1";
      const res = await handleEarlyAccess(post("/api/early-access", lead({ note: evil })));
      expect(res.status).toBe(201);
      const r = await rows("SELECT note FROM early_access_leads");
      expect(r[0].note).toBe(evil);
      expect((await rows("SHOW TABLES LIKE 'early_access_leads'"))).toHaveLength(1);
    });

    it("rate-limits per hashed IP (429 with Retry-After) and never stores the IP", async () => {
      const ip = "203.0.113.77";
      for (let i = 0; i < 5; i++) expect((await handleEarlyAccess(post("/api/early-access", lead({ contact: `user${i}@example.com` }), { ip }))).status).toBe(201);
      const blocked = await handleEarlyAccess(post("/api/early-access", lead({ contact: "user9@example.com" }), { ip }));
      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
      expect((await handleEarlyAccess(post("/api/early-access", lead({ contact: "other@example.com" }), { ip: "203.0.113.78" }))).status).toBe(201);
      const keys = await rows("SELECT key_hash FROM rate_limits");
      expect(keys.every(k => /^[0-9a-f]{64}$/.test(k.key_hash) && !k.key_hash.includes("203"))).toBe(true);
    });
  });

  describe("unknown client IP (proxy header missing)", () => {
    beforeEach(async () => { await conn.query("DELETE FROM early_access_leads"); await conn.query("DELETE FROM rate_limits"); });
    it("uses a much higher shared limit so real visitors aren't locked out", async () => {
      const noIp = (i: number) => new Request(`${ORIGIN}/api/early-access`, { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN }, body: JSON.stringify(lead({ contact: `shared${i}@example.com` })) });
      for (let i = 0; i < 12; i++) expect((await handleEarlyAccess(noIp(i))).status).toBe(201);
      const r = await rows("SELECT hits FROM rate_limits WHERE bucket = 'early_access'");
      expect(r).toHaveLength(1);
      expect(Number(r[0].hits)).toBe(12);
    });
  });

  describe("POST /api/events/batch", () => {
    beforeEach(async () => { await conn.query("DELETE FROM batch_events"); await conn.query("DELETE FROM rate_limits"); });
    it("records an anonymous batch summary", async () => {
      const res = await handleBatchEvent(post("/api/events/batch", batch()));
      expect(res.status).toBe(201);
      const r = await rows("SELECT preset_key, processed_count, pass_count, device_class, used_worker FROM batch_events");
      expect(r).toEqual([{ preset_key: "amazon", processed_count: 10, pass_count: 7, device_class: "mobile", used_worker: 1 }]);
    });
    it("rejects inconsistent or extra data", async () => {
      expect((await handleBatchEvent(post("/api/events/batch", batch({ passCount: 9 })))).status).toBe(422);
      expect((await handleBatchEvent(post("/api/events/batch", batch({ fileName: "secret.jpg" })))).status).toBe(422);
      expect((await rows("SELECT COUNT(*) AS n FROM batch_events"))[0].n).toBe(0);
    });
  });

  describe("failure handling", () => {
    it("health reports the database as up", async () => {
      const res = await handleHealth();
      expect(res.status).toBe(200);
      expect((await res.json()).data.database).toBe("up");
    });
    it("answers 503 service_unavailable when the database isn't configured", async () => {
      useEnv({ DATABASE_URL: undefined });
      const res = await handleEarlyAccess(post("/api/early-access", lead()));
      expect(res.status).toBe(503);
      expect((await res.json()).error.code).toBe("service_unavailable");
    });
    it("answers 503 database_unavailable without leaking details when the database is down", async () => {
      useEnv({ DATABASE_URL: URL_.replace(/:(\d+)\//, ":3999/") });
      const res = await handleEarlyAccess(post("/api/early-access", lead()));
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error.code).toBe("database_unavailable");
      expect(JSON.stringify(body)).not.toMatch(/ECONNREFUSED|3999|password|mysql:/i);
      expect((await handleHealth()).status).toBe(503);
    });
  });
});

describe.runIf(!enabled)("database tests skipped", () => {
  it("set TEST_DATABASE_URL to a database whose name ends in _test", () => expect(true).toBe(true));
});

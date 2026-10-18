import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("database/hostinger_setup.sql", () => {
  it("contains every migration verbatim with the checksum the migration runner expects", () => {
    const setup = fs.readFileSync(path.join("database", "hostinger_setup.sql"), "utf8");
    const dir = path.join("database", "migrations");
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith(".sql"))) {
      const sql = fs.readFileSync(path.join(dir, f), "utf8");
      const sum = crypto.createHash("sha256").update(sql).digest("hex");
      expect(setup, `${f} is out of date: run node scripts/build-hostinger-sql.mjs`).toContain(sql.trimEnd());
      expect(setup).toContain(`('${f.replace(/\.sql$/, "")}', '${sum}')`);
    }
  });
});

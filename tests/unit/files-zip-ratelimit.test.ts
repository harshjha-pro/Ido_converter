import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { acceptImages, csvReport, outputName, sniffImageType } from "@/lib/image/files";
import { buildZip } from "@/lib/image/zip";
import { hashKey, windowStart } from "@/lib/server/rateLimit";
import { resetEnvCache } from "@/lib/server/env";

describe("outputName", () => {
  it("applies the pattern, strips unsafe characters and de-duplicates", () => {
    const used = new Set<string>();
    expect(outputName("{name}.MAIN", "B0ABC.jpg", 0, used)).toBe("B0ABC.MAIN.jpg");
    expect(outputName("{name}.MAIN", "B0ABC.png", 1, used)).toBe("B0ABC.MAIN-2.jpg");
    expect(outputName("shoe-{n}", "x.jpg", 6, used)).toBe("shoe-007.jpg");
    expect(outputName("{name}", "../../etc/pass:wd.jpg", 0, used)).toBe("..-..-etc-pass-wd.jpg");
  });
});

describe("outputName with other formats", () => {
  it("uses the given extension and de-duplicates per extension", () => {
    const used = new Set<string>();
    expect(outputName("{name}", "a.png", 0, used, "webp")).toBe("a.webp");
    expect(outputName("{name}", "a.jpg", 1, used, "webp")).toBe("a-2.webp");
    expect(outputName("{name}", "a.jpg", 2, used, "png")).toBe("a.png");
    expect(outputName("", "x.jpg", 3, used)).toBe("x.jpg");
  });
});

const JPG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const WEBP = [...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")];

describe("sniffImageType", () => {
  it("recognises JPG, PNG and WebP by their first bytes", () => {
    expect(sniffImageType(new Uint8Array(JPG))).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array(PNG))).toBe("image/png");
    expect(sniffImageType(new Uint8Array(WEBP))).toBe("image/webp");
  });
  it("rejects SVG, GIF, HEIC, text and truncated headers", () => {
    for (const t of ["<svg xmlns=", "GIF89a......", "\0\0\0\x18ftypheic", "hello world!", ""]) expect(sniffImageType(new Uint8Array(Buffer.from(t)))).toBeNull();
    expect(sniffImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(sniffImageType(new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WAVE")]))).toBeNull();
  });
});

describe("acceptImages", () => {
  it("trusts content over the name and relabels the type", async () => {
    const files = [
      new File([new Uint8Array(PNG)], "photo.jpg", { type: "image/jpeg" }), // a PNG named .jpg
      new File([new Uint8Array(JPG)], "IMG_0001", { type: "" }),            // no extension, no type
      new File(["<svg onload=alert(1)>"], "evil.png", { type: "image/png" }),
      new File([new Uint8Array(WEBP)], "ok.webp", { type: "image/webp" }),
    ];
    const { accepted, skipped } = await acceptImages(files);
    expect(skipped).toBe(1);
    expect(accepted.map(f => [f.name, f.type])).toEqual([["photo.jpg", "image/png"], ["IMG_0001", "image/jpeg"], ["ok.webp", "image/webp"]]);
    expect(accepted[2]).toBe(files[3]); // unchanged files are passed through as-is
  });
});

describe("csvReport", () => {
  it("neutralises spreadsheet formulas in file names", () => {
    const csv = csvReport([{ original: "=HYPERLINK(\"http://x\")", inKB: 1 }, { original: "@SUM(A1)", inKB: 1 }, { original: "ok, name.jpg", inKB: 2 }], "Amazon India");
    const lines = csv.replace("\uFEFF", "").split("\r\n");
    expect(lines[1].startsWith(`"'=HYPERLINK(""http://x"")"`)).toBe(true);
    expect(lines[2].startsWith("'@SUM(A1)")).toBe(true);
    expect(lines[3].startsWith('"ok, name.jpg"')).toBe(true);
  });
});

describe("buildZip", () => {
  it("writes valid local headers, CRC-32 and an end record", async () => {
    const zip = await buildZip([{ name: "folder/hello.txt", blob: new Blob(["hello"]) }]);
    const b = new Uint8Array(await zip.arrayBuffer());
    const dv = new DataView(b.buffer);
    expect(dv.getUint32(0, true)).toBe(0x04034b50);
    expect(dv.getUint32(14, true)).toBe(0x3610a686); // CRC-32("hello")
    expect(dv.getUint32(b.length - 22, true)).toBe(0x06054b50);
    expect(dv.getUint16(b.length - 22 + 10, true)).toBe(1);
  });
});

describe("rate limit helpers", () => {
  afterEach(() => { delete process.env.IP_HASH_SECRET; resetEnvCache(); });
  it("floors to the window start", () => {
    expect(windowStart(new Date("2026-10-18T10:59:59.999Z"), 3600).toISOString()).toBe("2026-10-18T10:00:00.000Z");
  });
  it("hashes IPs with the server secret (not reversible, secret-dependent)", () => {
    process.env.IP_HASH_SECRET = "a".repeat(40); resetEnvCache();
    const h1 = hashKey("203.0.113.9");
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).not.toContain("203");
    process.env.IP_HASH_SECRET = "b".repeat(40); resetEnvCache();
    expect(hashKey("203.0.113.9")).not.toBe(h1);
  });
});

describe("server code stays on the server", () => {
  it("no client component imports lib/server", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) walk(p);
        else if (/\.(tsx?|jsx?)$/.test(f.name)) {
          const src = fs.readFileSync(p, "utf8");
          if (src.startsWith('"use client"') && /lib\/server/.test(src)) offenders.push(p);
        }
      }
    };
    walk(path.resolve("components")); walk(path.resolve("app"));
    expect(offenders).toEqual([]);
  });
});

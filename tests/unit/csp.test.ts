import { describe, expect, it } from "vitest";
import { buildCsp, newNonce } from "@/lib/csp";

const directives = (csp: string) => new Map(csp.split("; ").map(d => { const [k, ...v] = d.split(" "); return [k, v]; }));

describe("buildCsp", () => {
  it("allows only nonce'd scripts and blocks plugins, framing and base-tag hijacks", () => {
    const d = directives(buildCsp("abc123"));
    expect(d.get("script-src")).toEqual(["'self'", "'nonce-abc123'", "'strict-dynamic'"]);
    expect(d.get("script-src")).not.toContain("'unsafe-inline'");
    expect(d.get("object-src")).toEqual(["'none'"]);
    expect(d.get("frame-ancestors")).toEqual(["'none'"]);
    expect(d.get("base-uri")).toEqual(["'self'"]);
    expect(d.get("connect-src")).toEqual(["'self'"]);
    expect(d.get("worker-src")).toEqual(["'self'", "blob:"]);
  });

  it("adds 'unsafe-eval' only in development", () => {
    expect(buildCsp("n")).not.toContain("unsafe-eval");
    expect(directives(buildCsp("n", true)).get("script-src")).toContain("'unsafe-eval'");
  });
});

describe("newNonce", () => {
  it("is 128 bits of base64 and differs per call", () => {
    const a = newNonce(), b = newNonce();
    expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(a).not.toBe(b);
  });
});

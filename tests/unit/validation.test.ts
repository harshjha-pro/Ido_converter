import { describe, expect, it } from "vitest";
import { batchEventSchema, CONSENT_VERSION, earlyAccessSchema, fieldErrors, normalizeContact } from "@/lib/validation";

const valid = { contact: "Seller@Example.com ", role: "seller", marketplaces: ["amazon"], monthlyPhotos: "50_200", consent: true, consentVersion: CONSENT_VERSION, source: "home" };

describe("normalizeContact", () => {
  it.each([
    ["Seller@Example.COM", { type: "email", value: "seller@example.com" }],
    ["98765 43210", { type: "phone", value: "+919876543210" }],
    ["+91-98765-43210", { type: "phone", value: "+919876543210" }],
    ["09876543210", { type: "phone", value: "+919876543210" }],
    ["919876543210", { type: "phone", value: "+919876543210" }],
    ["+44 7700 900123", { type: "phone", value: "+447700900123" }],
  ])("normalises %s", (input, out) => expect(normalizeContact(input)).toEqual(out));

  it.each(["", "12345", "5876543210", "not-an-email@", "a@b", "+0123456789", "' OR 1=1 --"])("rejects %j", input =>
    expect(normalizeContact(input)).toBeNull());
});

describe("earlyAccessSchema", () => {
  it("accepts a complete submission and defaults optional fields", () => {
    const r = earlyAccessSchema.parse(valid);
    expect(r.note).toBe(""); expect(r.website).toBe("");
  });
  it("requires consent to be exactly true", () => {
    expect(earlyAccessSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(earlyAccessSchema.safeParse({ ...valid, consent: "true" }).success).toBe(false);
  });
  it("rejects unknown fields (no mass assignment)", () => {
    expect(earlyAccessSchema.safeParse({ ...valid, isAdmin: true }).success).toBe(false);
  });
  it("rejects an outdated consent version", () => {
    expect(earlyAccessSchema.safeParse({ ...valid, consentVersion: "2020-01-01" }).success).toBe(false);
  });
  it("reports readable field errors", () => {
    const r = earlyAccessSchema.safeParse({ ...valid, contact: "nope", marketplaces: [] });
    expect(r.success).toBe(false);
    const f = fieldErrors(r.error!);
    expect(f.contact).toMatch(/valid email or mobile/);
    expect(f.marketplaces).toMatch(/at least one/);
  });
  it("caps note length", () => {
    expect(earlyAccessSchema.safeParse({ ...valid, note: "x".repeat(501) }).success).toBe(false);
  });
});

describe("batchEventSchema", () => {
  const e = { presetKey: "amazon", photoCount: 10, processedCount: 10, passCount: 7, checkCount: 2, failCount: 1, durationMs: 5000, outputSize: 1600, deviceClass: "desktop", usedWorker: true, cancelled: false, usedSamples: false };
  it("accepts consistent counts", () => expect(batchEventSchema.safeParse(e).success).toBe(true));
  it("rejects counts that don't add up", () => expect(batchEventSchema.safeParse({ ...e, passCount: 8 }).success).toBe(false));
  it("rejects processed > photos", () => expect(batchEventSchema.safeParse({ ...e, processedCount: 11, passCount: 8 }).success).toBe(false));
  it("rejects batches over the 100-photo limit", () => expect(batchEventSchema.safeParse({ ...e, photoCount: 101 }).success).toBe(false));
  it("rejects non-integers and extra fields", () => {
    expect(batchEventSchema.safeParse({ ...e, durationMs: 1.5 }).success).toBe(false);
    expect(batchEventSchema.safeParse({ ...e, fileNames: ["a.jpg"] }).success).toBe(false);
  });
});

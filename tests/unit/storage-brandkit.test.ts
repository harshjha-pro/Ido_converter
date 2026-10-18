import { describe, expect, it } from "vitest";
import { MAX_SAVED, parseSaved, sameShape, upsertSaved } from "@/lib/storage";
import { dataUrlToFile, validateKit } from "@/lib/brandKit";
import { DEFAULT_FORM, validateConverterForm } from "@/lib/image/converterForm";
import { DEFAULT_WATERMARK, validateWatermarkForm } from "@/lib/image/watermarkForm";
import { fromPreset, validateProductSettings } from "@/components/tool/product/types";

const PNG_URL = "data:image/png;base64,iVBORw0KGgo=";

describe("saved settings", () => {
  const v = sameShape({ a: "", n: 0, on: false, list: [] as string[] });
  it("keeps only well-formed entries with the expected field types", () => {
    const raw = [
      { name: " Client A ", value: { a: "x", n: 1, on: true, list: ["k"], extra: "dropped" }, savedAt: "2026-10-18T00:00:00Z" },
      { name: "", value: { a: "x", n: 1, on: true, list: [] } },
      { name: "Bad types", value: { a: 1, n: 1, on: true, list: [] } },
      { name: "Bad list", value: { a: "x", n: 1, on: true, list: [1] } },
      "junk", null,
    ];
    expect(parseSaved(raw, v)).toEqual([{ name: "Client A", value: { a: "x", n: 1, on: true, list: ["k"] }, savedAt: "2026-10-18T00:00:00Z" }]);
    expect(parseSaved({ not: "a list" }, v)).toEqual([]);
  });
  it("replaces by name case-insensitively, newest first, capped", () => {
    let list = upsertSaved([], "Square", 1, new Date(0));
    list = upsertSaved(list, "square", 2, new Date(1));
    expect(list).toEqual([{ name: "square", value: 2, savedAt: new Date(1).toISOString() }]);
    for (let i = 0; i < 30; i++) list = upsertSaved(list, `s${i}`, i);
    expect(list).toHaveLength(MAX_SAVED);
    expect(list[0].name).toBe("s29");
  });
  it("tool validators reject values the forms can't produce", () => {
    expect(validateConverterForm(DEFAULT_FORM)).toEqual(DEFAULT_FORM);
    expect(validateConverterForm({ ...DEFAULT_FORM, format: "image/gif" })).toBeNull();
    expect(validateConverterForm({ ...DEFAULT_FORM, rotate: 45 })).toBeNull();
    expect(validateWatermarkForm({ ...DEFAULT_WATERMARK, placement: "tile" })).not.toBeNull();
    expect(validateWatermarkForm({ ...DEFAULT_WATERMARK, placement: "middle" })).toBeNull();
    expect(validateProductSettings({ ...fromPreset("amazon"), extras: ["meesho", "ebay"] })?.extras).toEqual(["meesho"]);
    expect(validateProductSettings({ ...fromPreset("amazon"), presetKey: "ebay" })).toBeNull();
  });
});

describe("brand kit", () => {
  it("accepts only the shape we write", () => {
    expect(validateKit({ name: "Teal & Co", colors: ["#1F4FD1"], logo: PNG_URL })).toEqual({ name: "Teal & Co", colors: ["#1F4FD1"], logo: PNG_URL });
    expect(validateKit({ name: "x", colors: [], logo: null })).not.toBeNull();
    expect(validateKit({ name: "x", colors: ["red"], logo: null })).toBeNull();
    expect(validateKit({ name: "x", colors: ["#000000", "#000000", "#000000", "#000000", "#000000"], logo: null })).toBeNull();
    expect(validateKit({ name: "x", colors: [], logo: "data:text/html;base64,PHNjcmlwdD4=" })).toBeNull();
    expect(validateKit({ name: "x", colors: [], logo: "javascript:alert(1)" })).toBeNull();
    expect(validateKit("junk")).toBeNull();
  });
  it("turns the stored logo back into a PNG file", async () => {
    const f = dataUrlToFile(PNG_URL);
    expect(f.type).toBe("image/png");
    expect([...new Uint8Array(await f.arrayBuffer())].slice(0, 4)).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });
});

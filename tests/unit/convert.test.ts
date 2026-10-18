import { describe, expect, it } from "vitest";
import { resolveFormat, safeBackground, targetSize } from "@/lib/image/convert";

const base = { resize: "none" as const, px: 0, noEnlarge: true, rotate: 0 as const };

describe("targetSize", () => {
  it("keeps size when not resizing", () => expect(targetSize(4000, 3000, base)).toMatchObject({ w: 4000, h: 3000 }));
  it("fits the longest side and keeps the aspect ratio", () =>
    expect(targetSize(4000, 3000, { ...base, resize: "longest", px: 1200 })).toMatchObject({ w: 1200, h: 900 }));
  it("resizes by width or by height", () => {
    expect(targetSize(4000, 3000, { ...base, resize: "width", px: 1000 })).toMatchObject({ w: 1000, h: 750 });
    expect(targetSize(4000, 3000, { ...base, resize: "height", px: 600 })).toMatchObject({ w: 800, h: 600 });
  });
  it("doesn't enlarge small images unless allowed", () => {
    expect(targetSize(800, 600, { ...base, resize: "longest", px: 1600 })).toMatchObject({ w: 800, h: 600, capped: true });
    expect(targetSize(800, 600, { ...base, resize: "longest", px: 1600, noEnlarge: false })).toMatchObject({ w: 1600, h: 1200, capped: false });
  });
  it("swaps width and height for 90° and 270° rotations before resizing", () => {
    expect(targetSize(4000, 3000, { ...base, rotate: 90 })).toMatchObject({ w: 3000, h: 4000 });
    expect(targetSize(4000, 3000, { ...base, rotate: 270, resize: "width", px: 1500 })).toMatchObject({ w: 1500, h: 2000 });
    expect(targetSize(4000, 3000, { ...base, rotate: 180 })).toMatchObject({ w: 4000, h: 3000 });
  });
  it("never returns zero or negative sizes", () => {
    expect(targetSize(5000, 2, { ...base, resize: "longest", px: 100 })).toMatchObject({ w: 100, h: 1 });
    expect(targetSize(4000, 3000, { ...base, resize: "longest", px: 0 })).toMatchObject({ w: 4000, h: 3000 });
    expect(targetSize(4000, 3000, { ...base, resize: "longest", px: -5 })).toMatchObject({ w: 4000, h: 3000 });
  });
});

describe("resolveFormat", () => {
  it("keeps PNG and WebP, and turns anything else into JPG", () => {
    expect(resolveFormat("keep", "image/png")).toBe("image/png");
    expect(resolveFormat("keep", "image/webp")).toBe("image/webp");
    expect(resolveFormat("keep", "image/jpeg")).toBe("image/jpeg");
    expect(resolveFormat("keep", "")).toBe("image/jpeg");
    expect(resolveFormat("image/webp", "image/png")).toBe("image/webp");
  });
});

describe("targetSize with a shape", () => {
  it("crops the centre to the aspect ratio", () => {
    const t = targetSize(4000, 3000, { ...base, aspect: 1, fit: "crop" });
    expect(t).toMatchObject({ w: 3000, h: 3000 });
    expect(t.draw).toEqual({ x: -500, y: 0, w: 4000, h: 3000 }); // 500 px trimmed off each side
  });
  it("pads to the aspect ratio and centres the whole image", () => {
    const t = targetSize(4000, 3000, { ...base, aspect: 1, fit: "pad" });
    expect(t).toMatchObject({ w: 4000, h: 4000 });
    expect(t.draw).toEqual({ x: 0, y: 500, w: 4000, h: 3000 });
  });
  it("handles tall images and wide targets", () => {
    expect(targetSize(1000, 2000, { ...base, aspect: 16 / 9, fit: "crop" })).toMatchObject({ w: 1000, h: 563 });
    expect(targetSize(1000, 2000, { ...base, aspect: 16 / 9, fit: "pad" })).toMatchObject({ w: 3556, h: 2000 });
  });
  it("gives an exact size with a custom ratio plus resize by width", () => {
    const t = targetSize(4000, 3000, { ...base, aspect: 1200 / 628, fit: "crop", resize: "width", px: 1200, noEnlarge: false });
    expect(t).toMatchObject({ w: 1200, h: 628 });
  });
  it("applies the shape after rotation", () => {
    expect(targetSize(4000, 3000, { ...base, rotate: 90, aspect: 4 / 5, fit: "crop" })).toMatchObject({ w: 3000, h: 3750 }); // 3000×4000 after rotating
  });
  it("resizes the shaped frame, not the original", () => {
    expect(targetSize(4000, 3000, { ...base, aspect: 1, fit: "pad", resize: "longest", px: 1000 })).toMatchObject({ w: 1000, h: 1000, scale: 0.25 });
  });
  it("ignores invalid aspect values", () => {
    for (const aspect of [0, -1, NaN, Infinity, null]) expect(targetSize(4000, 3000, { ...base, aspect, fit: "crop" })).toMatchObject({ w: 4000, h: 3000 });
  });
});

describe("safeBackground", () => {
  it("accepts #RRGGBB and transparent, and falls back to white", () => {
    expect(safeBackground("#12ab9F")).toBe("#12ab9F");
    expect(safeBackground("transparent")).toBe("transparent");
    for (const bad of ["red", "#fff", "url(x)", "", "#1234567"]) expect(safeBackground(bad)).toBe("#FFFFFF");
  });
});

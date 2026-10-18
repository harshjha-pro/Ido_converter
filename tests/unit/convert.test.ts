import { describe, expect, it } from "vitest";
import { resolveFormat, targetSize } from "@/lib/image/convert";

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

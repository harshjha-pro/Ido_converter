import { describe, expect, it } from "vitest";
import { clampOpacity, placements } from "@/lib/image/watermark";
import { DEFAULT_WATERMARK, problem, toWatermarkSettings } from "@/lib/image/watermarkForm";

describe("placements", () => {
  it("puts a single mark at each anchor, inside the margin", () => {
    expect(placements(1000, 800, 100, 50, "top-left", 20)).toEqual([{ x: 20, y: 20, w: 100, h: 50 }]);
    expect(placements(1000, 800, 100, 50, "bottom-right", 20)).toEqual([{ x: 880, y: 730, w: 100, h: 50 }]);
    expect(placements(1000, 800, 100, 50, "center", 20)).toEqual([{ x: 450, y: 375, w: 100, h: 50 }]);
    expect(placements(1000, 800, 100, 50, "top", 0)).toEqual([{ x: 450, y: 0, w: 100, h: 50 }]);
    expect(placements(1000, 800, 100, 50, "left", 10)).toEqual([{ x: 10, y: 375, w: 100, h: 50 }]);
  });

  it("tiles the whole image, staggering alternate rows", () => {
    const tiles = placements(1000, 600, 100, 40, "tile", 0);
    expect(tiles.length).toBeGreaterThan(10);
    const rows = [...new Set(tiles.map(t => t.y))];
    expect(rows).toEqual([0, 120, 240, 360, 480]);
    expect(tiles.filter(t => t.y === 0)[0].x).toBe(0);
    expect(tiles.filter(t => t.y === 120)[0].x).toBe(100); // staggered by one mark width
    for (const t of tiles) { expect(t.x).toBeLessThan(1000); expect(t.x + t.w).toBeGreaterThan(0); }
  });

  it("returns nothing for an empty mark", () => {
    expect(placements(1000, 800, 0, 50, "center", 0)).toEqual([]);
    expect(placements(1000, 800, 100, 0, "tile", 0)).toEqual([]);
  });

  it("keeps opacity in range", () => {
    expect(clampOpacity(0)).toBe(0.05);
    expect(clampOpacity(2)).toBe(1);
    expect(clampOpacity(NaN)).toBe(0.5);
  });
});

describe("watermark form", () => {
  it("explains what blocks the batch", () => {
    expect(problem(DEFAULT_WATERMARK, false)).toBe("Enter the watermark text first.");
    expect(problem({ ...DEFAULT_WATERMARK, text: "  " }, false)).toBe("Enter the watermark text first.");
    expect(problem({ ...DEFAULT_WATERMARK, text: "© Shop" }, false)).toBe("");
    expect(problem({ ...DEFAULT_WATERMARK, kind: "logo" }, false)).toBe("Choose a logo image first.");
    expect(problem({ ...DEFAULT_WATERMARK, kind: "logo" }, true)).toBe("");
    expect(problem({ ...DEFAULT_WATERMARK, text: "x", opacity: "1" }, false)).toBe("Fix the highlighted setting first.");
    expect(problem({ ...DEFAULT_WATERMARK, text: "x", textSize: "31" }, false)).toBe("Fix the highlighted setting first.");
    expect(problem({ ...DEFAULT_WATERMARK, kind: "logo", logoSize: "4" }, true)).toBe("Fix the highlighted setting first.");
    expect(problem({ ...DEFAULT_WATERMARK, text: "x", color: "white" }, false)).toBe("Choose a valid colour.");
  });

  it("maps percentages to engine fractions and only sends the logo in logo mode", () => {
    const logo = new Blob(["x"]);
    expect(toWatermarkSettings({ ...DEFAULT_WATERMARK, text: "Shop" }, logo)).toMatchObject({ kind: "text", size: 0.05, opacity: 0.6, margin: 0.03, quality: 0.9, logo: undefined });
    expect(toWatermarkSettings({ ...DEFAULT_WATERMARK, kind: "logo" }, logo)).toMatchObject({ kind: "logo", size: 0.2, logo });
  });
});

import { describe, expect, it } from "vitest";
import { extraKeys, presetDefaults, zipName } from "@/lib/image/productPlan";
import { PRESETS } from "@/lib/presets";

describe("product plan", () => {
  it("uses each preset's published defaults", () => {
    expect(presetDefaults("meesho")).toEqual({ presetKey: "meesho", size: 1200, fill: 0.85, maxBytes: PRESETS.meesho.maxKB * 1024, clean: true, tolerance: 240, minSide: 1000 });
  });
  it("keeps only real marketplaces other than the main one, in display order", () => {
    expect(extraKeys("amazon", ["meesho", "flipkart", "amazon"])).toEqual(["flipkart", "meesho"]);
    expect(extraKeys("custom", ["custom", "meesho"])).toEqual(["meesho"]);
    expect(extraKeys("flipkart", [])).toEqual([]);
  });
  it("names the ZIP after the marketplace unless it holds several", () => {
    expect(zipName("amazon-in-main", 0)).toBe("idoconverter-amazon-in-main.zip");
    expect(zipName("amazon-in-main", 2)).toBe("idoconverter-product-photos.zip");
  });
});

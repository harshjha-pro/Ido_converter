import { describe, expect, it } from "vitest";
import { DEFAULT_FORM, aspectOf, isValid, toSettings } from "@/lib/image/converterForm";

describe("converter form", () => {
  it("maps preset shapes and custom ratios to width ÷ height", () => {
    expect(aspectOf({ ...DEFAULT_FORM, shape: "original" })).toBeNull();
    expect(aspectOf({ ...DEFAULT_FORM, shape: "16:9" })).toBeCloseTo(16 / 9);
    expect(aspectOf({ ...DEFAULT_FORM, shape: "9:16" })).toBeCloseTo(9 / 16);
    expect(aspectOf({ ...DEFAULT_FORM, shape: "custom", ratioW: "1200", ratioH: "628" })).toBeCloseTo(1200 / 628);
  });

  it("rejects out-of-range numbers and bad colours", () => {
    expect(isValid(DEFAULT_FORM)).toBe(true);
    expect(isValid({ ...DEFAULT_FORM, quality: "5" })).toBe(false);
    expect(isValid({ ...DEFAULT_FORM, resize: "width", px: "" })).toBe(false);
    expect(isValid({ ...DEFAULT_FORM, resize: "none", px: "" })).toBe(true);
    expect(isValid({ ...DEFAULT_FORM, shape: "custom", ratioW: "0" })).toBe(false);
    expect(isValid({ ...DEFAULT_FORM, shape: "original", ratioW: "0" })).toBe(true);
    expect(isValid({ ...DEFAULT_FORM, background: "custom", color: "blue" })).toBe(false);
    expect(isValid({ ...DEFAULT_FORM, background: "custom", color: "#00AA11" })).toBe(true);
  });

  it("builds engine settings", () => {
    expect(toSettings({ ...DEFAULT_FORM, quality: "75", shape: "1:1", fit: "pad", background: "black" }))
      .toMatchObject({ quality: 0.75, aspect: 1, fit: "pad", background: "#000000", format: "image/webp" });
    expect(toSettings({ ...DEFAULT_FORM, background: "transparent" }).background).toBe("transparent");
    expect(toSettings({ ...DEFAULT_FORM, background: "custom", color: "#ABCDEF" }).background).toBe("#ABCDEF");
  });
});

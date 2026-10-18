import { describe, expect, it } from "vitest";
import { TEMPLATES, templateById } from "@/lib/templates/catalog";
import { fitRect, wrapText } from "@/lib/templates/render";
import { historyReducer, initialState, restoreDraft, startHistory, withBrand, HISTORY_LIMIT } from "@/lib/templates/state";

const mono = (s: string) => s.length * 10; // every character 10 px wide

describe("wrapText", () => {
  it("wraps on spaces within the width", () => {
    expect(wrapText("one two three four", 100, mono, 5)).toEqual(["one two", "three four"]);
  });
  it("keeps line breaks the user typed", () => {
    expect(wrapText("a\nb", 100, mono, 5)).toEqual(["a", "b"]);
  });
  it("breaks a word wider than the box", () => {
    expect(wrapText("abcdefghijkl", 50, mono, 5)).toEqual(["abcde", "fghij", "kl"]);
  });
  it("ends with an ellipsis when the text runs past maxLines", () => {
    const lines = wrapText("one two three four five six", 100, mono, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("…")).toBe(true);
    expect(mono(lines[1])).toBeLessThanOrEqual(100);
  });
  it("handles empty and Unicode text", () => {
    expect(wrapText("", 100, mono, 2)).toEqual([""]);
    expect(wrapText("₹499 दिवाली ऑफ़र", 1000, mono, 1)).toEqual(["₹499 दिवाली ऑफ़र"]);
  });
});

describe("fitRect", () => {
  const box = { x: 0, y: 0, w: 100, h: 100 };
  it("contains a wide image, centred", () => expect(fitRect(200, 100, box, "contain")).toEqual({ x: 0, y: 25, w: 100, h: 50 }));
  it("covers with a wide image, trimming the sides", () => expect(fitRect(200, 100, box, "cover")).toEqual({ x: -50, y: 0, w: 200, h: 100 }));
});

describe("catalog", () => {
  it("has unique ids and elements inside the canvas", () => {
    expect(new Set(TEMPLATES.map(t => t.id)).size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      const ids = t.elements.flatMap(e => ("id" in e ? [e.id] : []));
      expect(new Set(ids).size, t.id).toBe(ids.length);
      for (const e of t.elements) {
        expect(e.x, t.id).toBeGreaterThanOrEqual(0);
        expect(e.y, t.id).toBeGreaterThanOrEqual(0);
        expect(e.x + e.w, t.id).toBeLessThanOrEqual(1.0001);
        if ("h" in e) expect(e.y + e.h, t.id).toBeLessThanOrEqual(1.0001);
      }
    }
    expect(templateById("weekend-sale")?.name).toBe("Weekend sale");
    expect(templateById("nope")).toBeUndefined();
  });
});

describe("design state", () => {
  const t = templateById("new-arrival")!;
  it("starts from the template's text and colours", () => {
    const s = initialState(t);
    expect(s.texts.name).toBe("Handmade teal mug");
    expect(s.palette).toEqual(t.palette);
    expect(s.fits.photo).toBe("contain");
  });
  it("restores only valid parts of a stored draft", () => {
    const d = restoreDraft(t, { texts: { name: "Blue mug", ghost: "x" }, scale: { name: 9 }, palette: { accent: "#ff0000", bg: "red" }, fits: { photo: "cover" } })!;
    expect(d.texts.name).toBe("Blue mug");
    expect(d.texts).not.toHaveProperty("ghost");
    expect(d.scale.name).toBe(1);
    expect(d.palette.accent).toBe("#ff0000");
    expect(d.palette.bg).toBe(t.palette.bg);
    expect(d.fits.photo).toBe("cover");
    expect(restoreDraft(t, "junk")).toBeNull();
  });
  it("applies brand colours in order and fills shop-name texts", () => {
    const s = withBrand(t, initialState(t), ["#123456", "#abcdef"], "Teal & Co");
    expect(s.palette.accent).toBe("#123456");
    expect(s.palette.ink).toBe("#ABCDEF");
    expect(s.palette.bg).toBe(t.palette.bg);
    expect(s.texts.shop).toBe("Teal & Co");
    expect(s.texts.name).toBe("Handmade teal mug");
  });
  it("undoes and redoes, merging typing in one field into one step", () => {
    let h = startHistory(initialState(t));
    h = historyReducer(h, { type: "set", patch: { texts: { ...h.present.texts, name: "B" } }, key: "text:name" });
    h = historyReducer(h, { type: "set", patch: { texts: { ...h.present.texts, name: "Bl" } }, key: "text:name" });
    h = historyReducer(h, { type: "set", patch: { palette: { ...h.present.palette, bg: "#000000" } }, key: "color:bg" });
    expect(h.past).toHaveLength(2);
    h = historyReducer(h, { type: "undo" });
    expect(h.present.texts.name).toBe("Bl");
    h = historyReducer(h, { type: "undo" });
    expect(h.present.texts.name).toBe("Handmade teal mug");
    h = historyReducer(h, { type: "redo" });
    expect(h.present.texts.name).toBe("Bl");
    expect(historyReducer(startHistory(initialState(t)), { type: "undo" }).past).toHaveLength(0);
  });
  it("caps the undo history", () => {
    let h = startHistory(initialState(t));
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) h = historyReducer(h, { type: "set", patch: { texts: { ...h.present.texts, name: String(i) } } });
    expect(h.past).toHaveLength(HISTORY_LIMIT);
  });
});

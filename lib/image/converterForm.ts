/** The converter's form state, its validation and its mapping to engine settings. Pure, so it is unit-tested. */
import type { ConvertSettings, FitMode, OutFormat, ResizeMode, Rotation } from "./convert";
import { sameShape } from "@/lib/storage";

export type Shape = "original" | "1:1" | "4:5" | "4:3" | "3:2" | "16:9" | "9:16" | "custom";
export type Background = "white" | "black" | "transparent" | "custom";

export interface ConverterForm {
  format: OutFormat; quality: string;
  shape: Shape; ratioW: string; ratioH: string; fit: FitMode; background: Background; color: string;
  resize: ResizeMode; px: string; noEnlarge: boolean;
  rotate: Rotation; flipH: boolean; flipV: boolean;
  pattern: string;
}

export const DEFAULT_FORM: ConverterForm = {
  format: "image/webp", quality: "82",
  shape: "original", ratioW: "1200", ratioH: "628", fit: "crop", background: "white", color: "#FFFFFF",
  resize: "none", px: "1600", noEnlarge: true,
  rotate: 0, flipH: false, flipV: false,
  pattern: "{name}",
};

export const SHAPES: [Shape, string][] = [
  ["original", "Original"], ["1:1", "1:1"], ["4:5", "4:5"], ["4:3", "4:3"], ["3:2", "3:2"], ["16:9", "16:9"], ["9:16", "9:16"], ["custom", "Custom"],
];

export const LIMITS_FORM = { quality: [10, 100], px: [16, 10000], ratio: [1, 10000] } as const;

export const inRange = (v: string, lo: number, hi: number) => { const n = Number(v); return v !== "" && Number.isFinite(n) && n >= lo && n <= hi; };
const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

/** Width ÷ height for the chosen shape, or null for "original". */
export function aspectOf(f: Pick<ConverterForm, "shape" | "ratioW" | "ratioH">): number | null {
  if (f.shape === "original") return null;
  if (f.shape === "custom") return Number(f.ratioW) / Number(f.ratioH);
  const [w, h] = f.shape.split(":").map(Number);
  return w / h;
}

export function isValid(f: ConverterForm): boolean {
  const [ql, qh] = LIMITS_FORM.quality, [pl, ph] = LIMITS_FORM.px, [rl, rh] = LIMITS_FORM.ratio;
  return inRange(f.quality, ql, qh)
    && (f.resize === "none" || inRange(f.px, pl, ph))
    && (f.shape !== "custom" || (inRange(f.ratioW, rl, rh) && inRange(f.ratioH, rl, rh)))
    && (f.background !== "custom" || isHex(f.color));
}

export function backgroundValue(f: Pick<ConverterForm, "background" | "color">): string {
  return f.background === "white" ? "#FFFFFF" : f.background === "black" ? "#000000" : f.background === "transparent" ? "transparent" : f.color;
}

export function toSettings(f: ConverterForm): ConvertSettings {
  return {
    format: f.format, quality: Number(f.quality) / 100, resize: f.resize, px: Number(f.px), noEnlarge: f.noEnlarge,
    rotate: f.rotate, flipH: f.flipH, flipV: f.flipV,
    aspect: aspectOf(f), fit: f.fit, background: backgroundValue(f),
  };
}

const FORMAT_VALUES = ["image/jpeg", "image/png", "image/webp", "keep"];
const RESIZE_VALUES = ["none", "longest", "width", "height"];
const shapeOf = sameShape(DEFAULT_FORM);

/** Accepts stored settings only if every field is a value this form can produce. */
export function validateConverterForm(v: unknown): ConverterForm | null {
  const f = shapeOf(v);
  if (!f) return null;
  const ok = FORMAT_VALUES.includes(f.format) && RESIZE_VALUES.includes(f.resize) && [0, 90, 180, 270].includes(f.rotate)
    && SHAPES.some(([k]) => k === f.shape) && ["crop", "pad"].includes(f.fit) && ["white", "black", "transparent", "custom"].includes(f.background);
  return ok ? f : null;
}

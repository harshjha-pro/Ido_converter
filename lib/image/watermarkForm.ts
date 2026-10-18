/** The watermark tool's form state, validation and mapping to engine settings. Pure, so it is unit-tested. */
import type { OutFormat } from "./convert";
import { ANCHORS, type Placement, type WatermarkSettings } from "./watermark";
import { sameShape } from "@/lib/storage";

export interface WatermarkForm {
  kind: "text" | "logo";
  text: string;
  color: string;
  textSize: string;   // % of the shorter side
  logoSize: string;   // % of the image width
  opacity: string;    // %
  placement: Placement;
  margin: string;     // % of the shorter side
  format: OutFormat;
  quality: string;    // %
  pattern: string;
}

export const DEFAULT_WATERMARK: WatermarkForm = {
  kind: "text", text: "", color: "#FFFFFF", textSize: "5", logoSize: "20", opacity: "60",
  placement: "bottom-right", margin: "3", format: "keep", quality: "90", pattern: "{name}",
};

export const WM_LIMITS = { textSize: [1, 30], logoSize: [5, 60], opacity: [5, 100], margin: [0, 20], quality: [10, 100] } as const;

const num = (v: string, [lo, hi]: readonly [number, number]) => { const n = Number(v); return v !== "" && Number.isFinite(n) && n >= lo && n <= hi; };

/** Why the batch can't run yet, or "" when it can. */
export function problem(f: WatermarkForm, hasLogo: boolean): string {
  if (f.kind === "text" && !f.text.trim()) return "Enter the watermark text first.";
  if (f.kind === "logo" && !hasLogo) return "Choose a logo image first.";
  if (!/^#[0-9a-f]{6}$/i.test(f.color)) return "Choose a valid colour.";
  const sizeOk = f.kind === "text" ? num(f.textSize, WM_LIMITS.textSize) : num(f.logoSize, WM_LIMITS.logoSize);
  if (!sizeOk || !num(f.opacity, WM_LIMITS.opacity) || !num(f.margin, WM_LIMITS.margin) || !num(f.quality, WM_LIMITS.quality)) return "Fix the highlighted setting first.";
  return "";
}

export function toWatermarkSettings(f: WatermarkForm, logo?: Blob): WatermarkSettings {
  return {
    kind: f.kind, text: f.text, color: f.color,
    size: (f.kind === "text" ? Number(f.textSize) : Number(f.logoSize)) / 100,
    opacity: Number(f.opacity) / 100, placement: f.placement, margin: Number(f.margin) / 100,
    format: f.format, quality: Number(f.quality) / 100, logo: f.kind === "logo" ? logo : undefined,
  };
}

const shapeOf = sameShape(DEFAULT_WATERMARK);

/** Accepts stored settings only if every field is a value this form can produce. The logo itself is never stored. */
export function validateWatermarkForm(v: unknown): WatermarkForm | null {
  const f = shapeOf(v);
  if (!f) return null;
  const ok = ["text", "logo"].includes(f.kind) && ([...ANCHORS, "tile"] as string[]).includes(f.placement)
    && ["image/jpeg", "image/png", "image/webp", "keep"].includes(f.format);
  return ok ? f : null;
}

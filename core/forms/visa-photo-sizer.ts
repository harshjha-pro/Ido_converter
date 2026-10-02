import type { ToolResult } from '../shared/types';
import presetData from './visa-photo-presets.json';

export interface PhotoPreset {
  id: string;
  country: string;
  document: string;
  widthMm: number | null;
  heightMm: number | null;
  outputWidth: number;
  outputHeight: number;
  outputNote: string;
  minBytes: number | null;
  maxBytes: number | null;
  rules: string[];
  source: { title: string; url: string };
  lastChecked: string;
  reviewedBy: string;
}

export const PRESETS: PhotoPreset[] = presetData.presets;

export function getPreset(id: string): PhotoPreset | undefined {
  return PRESETS.find(p => p.id === id);
}

/** AGENTS.md rule 5: a visa tool may only be published once every preset has a named reviewer. */
export function allPresetsReviewed(presets: PhotoPreset[] = PRESETS): boolean {
  return presets.length > 0 && presets.every(p => p.reviewedBy.trim() !== '');
}

export interface CropRequest {
  imageWidth: number;
  imageHeight: number;
  /** Output width ÷ height. */
  aspect: number;
  /** 1 = largest crop that fits; 2 = half the width and height (zoomed in). */
  zoom: number;
  /** Crop centre as a fraction of the image (0–1). Clamped so the crop stays inside the image. */
  centerX: number;
  centerY: number;
}

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function computeCrop(req: CropRequest): ToolResult<CropRect> {
  const { imageWidth: W, imageHeight: H, aspect, zoom, centerX, centerY } = req;
  for (const [name, v] of [['Image width', W], ['Image height', H], ['Aspect ratio', aspect]] as const) {
    if (!Number.isFinite(v) || v <= 0) return { ok: false, error: `${name} must be more than 0` };
  }
  if (!Number.isFinite(zoom) || zoom < 1) return { ok: false, error: 'Zoom must be 1 or more' };
  if (![centerX, centerY].every(c => Number.isFinite(c) && c >= 0 && c <= 1)) {
    return { ok: false, error: 'Position must be between 0 and 1' };
  }

  // Largest rectangle of the target shape that fits inside the image, then shrink by zoom.
  let sw = W;
  let sh = W / aspect;
  if (sh > H) { sh = H; sw = H * aspect; }
  sw /= zoom;
  sh /= zoom;

  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  const sx = clamp(centerX * W - sw / 2, 0, W - sw);
  const sy = clamp(centerY * H - sh / 2, 0, H - sh);
  return { ok: true, output: { sx, sy, sw, sh } };
}

/** Warns when the crop would be enlarged to reach the output size, which makes it look soft. */
export function upscaleFactor(crop: CropRect, preset: PhotoPreset): number {
  return Math.max(preset.outputWidth / crop.sw, preset.outputHeight / crop.sh);
}

export interface QualityResult {
  quality: number;
  bytes: number;
  withinLimits: boolean;
  message: string;
}

/**
 * Picks the highest JPEG quality whose file size fits the preset's limits. The encoder is
 * injected (canvas.toBlob in the browser) so this search stays pure and testable.
 */
export async function findQuality(
  encode: (quality: number) => Promise<number>,
  limits: { minBytes: number | null; maxBytes: number | null },
): Promise<QualityResult> {
  const { minBytes, maxBytes } = limits;
  const fmt = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(2)} MB` : `${Math.round(b / 1000)} KB`);
  const best = await encode(0.92);

  if (maxBytes === null || best <= maxBytes) {
    if (minBytes !== null && best < minBytes) {
      const top = await encode(1);
      const ok = top >= minBytes;
      return { quality: 1, bytes: top, withinLimits: ok,
        message: ok ? `${fmt(top)}, within the limit.` : `${fmt(top)} is below the ${fmt(minBytes)} minimum even at full quality. Use a larger, sharper original photo.` };
    }
    return { quality: 0.92, bytes: best, withinLimits: true, message: `${fmt(best)}${maxBytes || minBytes ? ', within the limit' : ''}.` };
  }

  // Binary search for the highest quality that fits under the maximum.
  let lo = 0.1, hi = 0.92, found: { q: number; b: number } | null = null;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    const size = await encode(mid);
    if (size <= maxBytes) { found = { q: mid, b: size }; lo = mid; } else { hi = mid; }
  }
  if (!found) {
    const floor = await encode(0.1);
    if (floor <= maxBytes) found = { q: 0.1, b: floor };
  }
  if (!found) {
    return { quality: 0.1, bytes: await encode(0.1), withinLimits: false,
      message: `Could not get under ${fmt(maxBytes)} even at low quality.` };
  }
  const q = Math.round(found.q * 100) / 100;
  const okMin = minBytes === null || found.b >= minBytes;
  return { quality: q, bytes: found.b, withinLimits: okMin,
    message: okMin ? `${fmt(found.b)} at ${Math.round(q * 100)}% quality, within the ${fmt(maxBytes)} limit.` : `Fits the maximum but is under the ${fmt(minBytes!)} minimum.` };
}

/** ToolResult contract entry point: input JSON { presetId, imageWidth, imageHeight, zoom, centerX, centerY } → crop plan. */
export function run(input: string): ToolResult<{ crop: CropRect; outputWidth: number; outputHeight: number }> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  let req: { presetId?: string; imageWidth?: number; imageHeight?: number; zoom?: number; centerX?: number; centerY?: number };
  try { req = JSON.parse(input); } catch { return { ok: false, error: 'Input must be JSON' }; }
  const preset = getPreset(String(req.presetId));
  if (!preset) return { ok: false, error: 'Unknown preset' };
  const crop = computeCrop({
    imageWidth: Number(req.imageWidth), imageHeight: Number(req.imageHeight),
    aspect: preset.outputWidth / preset.outputHeight,
    zoom: req.zoom ?? 1, centerX: req.centerX ?? 0.5, centerY: req.centerY ?? 0.5,
  });
  if (!crop.ok || !crop.output) return { ok: false, error: crop.error };
  return { ok: true, output: { crop: crop.output, outputWidth: preset.outputWidth, outputHeight: preset.outputHeight } };
}

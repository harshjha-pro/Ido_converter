/**
 * Watermarking: stamps text or a logo onto each image, at one position or tiled.
 * Runs in the Web Worker or on the main thread, like the other engines.
 */
import { LIMITS } from "@/lib/config";
import { ctx2d, decode, makeCanvas, release } from "./engine";
import { EXT, encode, resolveFormat, safeBackground, type ConvertResult, type OutFormat } from "./convert";

export type Anchor = "top-left" | "top" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom" | "bottom-right";
export type Placement = Anchor | "tile";

export interface WatermarkSettings {
  kind: "text" | "logo";
  text: string;
  color: string;        // "#RRGGBB"
  opacity: number;      // 0.05–1
  /** Text: cap height as a share of the image's shorter side. Logo: width as a share of the image width. */
  size: number;
  placement: Placement;
  margin: number;       // share of the shorter side
  format: OutFormat;
  quality: number;      // 0.1–1
  logo?: Blob;
}

export interface Rect { x: number; y: number; w: number; h: number }

export const ANCHORS: Anchor[] = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"];
export const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", "Helvetica Neue", Arial, sans-serif';

/** Where the mark goes on an image. Pure, so it is unit-tested. Tiling staggers alternate rows so marks don't line up in columns. */
export function placements(imgW: number, imgH: number, markW: number, markH: number, placement: Placement, margin: number): Rect[] {
  if (markW <= 0 || markH <= 0) return [];
  if (placement === "tile") {
    const stepX = markW * 2, stepY = markH * 3;
    const out: Rect[] = [];
    let row = 0;
    for (let y = margin; y < imgH; y += stepY, row++) {
      for (let x = margin - (row % 2 ? markW : 0); x < imgW; x += stepX) {
        if (x + markW > 0) out.push({ x: Math.round(x), y: Math.round(y), w: markW, h: markH });
      }
    }
    return out;
  }
  const col = placement.endsWith("left") ? 0 : placement.endsWith("right") ? 2 : 1;
  const row = placement.startsWith("top") ? 0 : placement.startsWith("bottom") ? 2 : 1;
  const x = col === 0 ? margin : col === 2 ? imgW - margin - markW : (imgW - markW) / 2;
  const y = row === 0 ? margin : row === 2 ? imgH - margin - markH : (imgH - markH) / 2;
  return [{ x: Math.round(x), y: Math.round(y), w: markW, h: markH }];
}

export function clampOpacity(v: number) { return Math.min(1, Math.max(0.05, Number.isFinite(v) ? v : 0.5)); }

export async function watermarkImage(file: Blob, s: WatermarkSettings): Promise<ConvertResult> {
  const r: ConvertResult = { status: "done", issues: [], inW: 0, inH: 0 };
  const fail = (m: string) => { r.status = "fail"; r.issues.push(m); return r; };
  if (file.size === 0) return fail("The file is empty.");
  if (file.size > LIMITS.maxBytes) return fail("Larger than 30 MB. Export a smaller copy and try again.");
  if (s.kind === "text" && !s.text.trim()) return fail("Enter the watermark text first.");
  if (s.kind === "logo" && !s.logo) return fail("Choose a logo image first.");

  let bmp: ImageBitmap;
  try { bmp = await decode(file); }
  catch { return fail("Couldn’t read this image. It may be damaged, or not really a JPG, PNG or WebP."); }
  const w = bmp.width, h = bmp.height;
  r.inW = w; r.inH = h;
  if ((w * h) / 1e6 > LIMITS.maxMegapixels) { bmp.close(); return fail(`${Math.round((w * h) / 1e6)} MP is over the ${LIMITS.maxMegapixels} MP limit.`); }

  let logo: ImageBitmap | null = null;
  if (s.kind === "logo") {
    try { logo = await decode(s.logo!); }
    catch { bmp.close(); return fail("Couldn’t read the logo. Use a JPG, PNG or WebP file."); }
  }

  const type = resolveFormat(s.format, (file as File).type ?? "");
  const out = makeCanvas(w, h);
  const ctx = ctx2d(out);
  if (type === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(bmp, 0, 0);
  bmp.close();

  const short = Math.min(w, h);
  const margin = Math.round(short * Math.min(0.2, Math.max(0, s.margin)));
  ctx.globalAlpha = clampOpacity(s.opacity);
  if (logo) {
    const markW = Math.max(1, Math.round(w * s.size));
    const markH = Math.max(1, Math.round((markW * logo.height) / logo.width));
    for (const p of placements(w, h, markW, markH, s.placement, margin)) ctx.drawImage(logo, p.x, p.y, p.w, p.h);
    logo.close();
  } else {
    const px = Math.max(8, Math.round(short * s.size));
    ctx.font = `600 ${px}px ${FONT_STACK}`;
    ctx.textBaseline = "top";
    ctx.fillStyle = safeBackground(s.color) === "transparent" ? "#FFFFFF" : safeBackground(s.color);
    const text = s.text.trim().slice(0, 100);
    const markW = Math.ceil(ctx.measureText(text).width);
    for (const p of placements(w, h, markW, px, s.placement, margin)) ctx.fillText(text, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  let blob: Blob;
  try { blob = await encode(out, type, s.quality); }
  catch { release(out); return fail("Your browser couldn’t save this image. Try another format."); }
  release(out);
  if (blob.type !== type) { r.status = "note"; r.issues.push(`Your browser can’t save ${EXT[type]?.toUpperCase() ?? type}, so this was saved as ${EXT[blob.type]?.toUpperCase() ?? blob.type} instead.`); }
  Object.assign(r, { blob, outType: blob.type, outW: w, outH: h });
  return r;
}

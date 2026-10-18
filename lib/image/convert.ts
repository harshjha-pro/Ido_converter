/**
 * General converter: format (JPG/PNG/WebP), resize, quality, rotate, flip.
 * Runs in the Web Worker or on the main thread, like the product-photo engine.
 */
import { LIMITS } from "@/lib/config";
import { ctx2d, decode, makeCanvas, release } from "./engine";

export type OutFormat = "image/jpeg" | "image/png" | "image/webp" | "keep";
export type ResizeMode = "none" | "longest" | "width" | "height";
export type Rotation = 0 | 90 | 180 | 270;
export type ConvertStatus = "done" | "note" | "fail";

export interface ConvertSettings {
  format: OutFormat;
  quality: number;      // 0.1–1, ignored for PNG
  resize: ResizeMode;
  px: number;           // target for the chosen mode
  noEnlarge: boolean;
  rotate: Rotation;
  flipH: boolean;
  flipV: boolean;
}

export interface ConvertResult {
  status: ConvertStatus;
  issues: string[];
  inW: number; inH: number;
  outW?: number; outH?: number;
  blob?: Blob;
  outType?: string;
}

export const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Output dimensions after rotation and resize. Pure, so it is unit-tested. */
export function targetSize(w: number, h: number, s: Pick<ConvertSettings, "resize" | "px" | "noEnlarge" | "rotate">) {
  const rw = s.rotate === 90 || s.rotate === 270 ? h : w;
  const rh = s.rotate === 90 || s.rotate === 270 ? w : h;
  if (s.resize === "none" || !(s.px > 0)) return { w: rw, h: rh, scale: 1, capped: false };
  const basis = s.resize === "width" ? rw : s.resize === "height" ? rh : Math.max(rw, rh);
  let scale = s.px / basis;
  let capped = false;
  if (s.noEnlarge && scale > 1) { scale = 1; capped = true; }
  return { w: Math.max(1, Math.round(rw * scale)), h: Math.max(1, Math.round(rh * scale)), scale, capped };
}

/** Which format to write when the user picks "keep original". */
export function resolveFormat(format: OutFormat, inputType: string): Exclude<OutFormat, "keep"> {
  if (format !== "keep") return format;
  return inputType === "image/png" || inputType === "image/webp" ? inputType : "image/jpeg";
}

async function encode(c: HTMLCanvasElement | OffscreenCanvas, type: string, quality: number): Promise<Blob> {
  if ("convertToBlob" in c) return c.convertToBlob({ type, quality });
  return new Promise((res, rej) => (c as HTMLCanvasElement).toBlob(b => (b ? res(b) : rej(new Error("encode"))), type, quality));
}

export async function convertImage(file: Blob, s: ConvertSettings): Promise<ConvertResult> {
  const r: ConvertResult = { status: "done", issues: [], inW: 0, inH: 0 };
  const note = (m: string) => { r.issues.push(m); if (r.status === "done") r.status = "note"; };
  if (file.size === 0) { r.status = "fail"; r.issues.push("The file is empty."); return r; }
  if (file.size > LIMITS.maxBytes) { r.status = "fail"; r.issues.push("Larger than 30 MB. Export a smaller copy and try again."); return r; }

  let bmp: ImageBitmap;
  try { bmp = await decode(file); }
  catch { r.status = "fail"; r.issues.push("Couldn’t read this image. It may be damaged, or not really a JPG, PNG or WebP."); return r; }
  r.inW = bmp.width; r.inH = bmp.height;
  if ((bmp.width * bmp.height) / 1e6 > LIMITS.maxMegapixels) {
    bmp.close(); r.status = "fail";
    r.issues.push(`${Math.round((bmp.width * bmp.height) / 1e6)} MP is over the ${LIMITS.maxMegapixels} MP limit.`);
    return r;
  }

  const type = resolveFormat(s.format, (file as File).type ?? "");
  const t = targetSize(bmp.width, bmp.height, s);
  if (t.capped) note("Already smaller than the size you chose, so it wasn’t enlarged.");

  const out = makeCanvas(t.w, t.h);
  const ctx = ctx2d(out);
  if (type === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, t.w, t.h); } // JPG has no transparency
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(t.w / 2, t.h / 2);
  ctx.rotate((s.rotate * Math.PI) / 180);
  ctx.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1);
  const sideways = s.rotate === 90 || s.rotate === 270;
  const dw = sideways ? t.h : t.w, dh = sideways ? t.w : t.h;
  ctx.drawImage(bmp, -dw / 2, -dh / 2, dw, dh);
  bmp.close();

  let blob: Blob;
  try { blob = await encode(out, type, s.quality); }
  catch { release(out); r.status = "fail"; r.issues.push("Your browser couldn’t save this image. Try a smaller size or another format."); return r; }
  release(out);

  if (blob.type !== type) note(`Your browser can’t save ${EXT[type]?.toUpperCase() ?? type}, so this was saved as ${EXT[blob.type]?.toUpperCase() ?? blob.type} instead.`);
  if (type === "image/jpeg" && ((file as File).type === "image/png" || (file as File).type === "image/webp")) note("Transparent areas, if any, are now white: JPG can’t store transparency.");
  if (blob.size > file.size && s.resize === "none") note(`The result is larger than the original (${Math.round(blob.size / 1024)} KB vs ${Math.round(file.size / 1024)} KB). ${blob.type === "image/png" ? "PNG suits graphics more than photos." : "Try a lower quality."}`);

  Object.assign(r, { blob, outType: blob.type, outW: t.w, outH: t.h });
  return r;
}

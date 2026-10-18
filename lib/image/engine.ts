/**
 * Image engine. Pure functions over pixel data plus a small canvas adapter,
 * so the same code runs inside a Web Worker (OffscreenCanvas) or on the main thread.
 */
import { LIMITS } from "@/lib/config";

export type Status = "pass" | "check" | "fail";

export interface ProcessSettings {
  presetKey: string;
  size: number;
  fill: number; // 0–1
  maxBytes: number;
  clean: boolean;
  tolerance: number;
  minSide: number;
}

export interface Box { x: number; y: number; w: number; h: number }

export interface ProcessResult {
  status: Status;
  issues: string[];
  inW: number;
  inH: number;
  background: string;
  blob?: Blob;
  outKB?: number;
  size?: number;
  box?: Box;
  fillPct?: number;
  target?: number;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const hasOffscreen = () => typeof OffscreenCanvas !== "undefined";

export function makeCanvas(w: number, h: number): AnyCanvas {
  if (hasOffscreen()) return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}
export function ctx2d(c: AnyCanvas, read = false): Ctx2D {
  const ctx = (c as HTMLCanvasElement).getContext("2d", read ? { willReadFrequently: true } : undefined) as Ctx2D | null;
  if (!ctx) throw new Error("canvas");
  return ctx;
}
export function release(c: AnyCanvas) { c.width = 0; c.height = 0; }
function encodeJpeg(c: AnyCanvas, quality: number): Promise<Blob> {
  if ("convertToBlob" in c) return (c as OffscreenCanvas).convertToBlob({ type: "image/jpeg", quality });
  return new Promise((res, rej) => (c as HTMLCanvasElement).toBlob(b => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", quality));
}

export async function decode(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

/** Share of edge pixels that are pure white / near white. */
export function edgeStats(d: Uint8ClampedArray, w: number, h: number, tol: number) {
  let n = 0, pure = 0, near = 0;
  const band = Math.max(1, Math.round(Math.min(w, h) * 0.005));
  const step = Math.max(1, Math.floor(Math.max(w, h) / 2000));
  const visit = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    n++;
    if (d[i] >= 254 && d[i + 1] >= 254 && d[i + 2] >= 254) pure++;
    if (d[i] >= tol && d[i + 1] >= tol && d[i + 2] >= tol) near++;
  };
  for (let k = 0; k < band; k++) {
    for (let x = 0; x < w; x += step) { visit(x, k); visit(x, h - 1 - k); }
    for (let y = 0; y < h; y += step) { visit(k, y); visit(w - 1 - k, y); }
  }
  return { pure: pure / n, near: near / n };
}

/**
 * Flood-fill from the image edges. Near-white pixels become pure white. Just below the
 * threshold, colourless (grey) pixels — the outer edge of soft shadows — are faded toward
 * white rather than cut, so shadows don't end in a hard ring. Coloured pixels stop the fill,
 * which protects cream, beige and other light product edges.
 */
export const SHADOW_FADE = 48;     // levels below the threshold that fade
const NEUTRAL_SPREAD = 14;         // max channel difference to count as grey

export function cleanBackground(d: Uint8ClampedArray, w: number, h: number, tol: number) {
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  const lo = tol - SHADOW_FADE;
  let sp = 0;
  const reachable = (p: number) => {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2];
    const mn = Math.min(r, g, b);
    if (mn >= tol) return true;
    return mn >= lo && Math.max(r, g, b) - mn <= NEUTRAL_SPREAD;
  };
  const push = (p: number) => { if (!seen[p] && reachable(p)) { seen[p] = 1; stack[sp++] = p; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (sp > 0) {
    const p = stack[--sp], i = p * 4;
    const mn = Math.min(d[i], d[i + 1], d[i + 2]);
    if (mn >= tol) {
      d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
    } else {
      // smoothstep from 0 at `lo` to 1 at `tol`
      const t0 = (mn - lo) / SHADOW_FADE, t = t0 * t0 * (3 - 2 * t0);
      d[i] = d[i] + (255 - d[i]) * t;
      d[i + 1] = d[i + 1] + (255 - d[i + 1]) * t;
      d[i + 2] = d[i + 2] + (255 - d[i + 2]) * t;
    }
    d[i + 3] = 255;
    const x = p % w;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (p >= w) push(p - w);
    if (p < w * (h - 1)) push(p + w);
  }
}

/** Bounding box of non-background pixels, ignoring speckle. */
export function productBox(d: Uint8ClampedArray, w: number, h: number, thr: number): Box | null {
  const rows = new Uint32Array(h), cols = new Uint32Array(w);
  for (let y = 0; y < h; y++) {
    let o = y * w * 4;
    for (let x = 0; x < w; x++, o += 4) {
      if (d[o] < thr || d[o + 1] < thr || d[o + 2] < thr) { rows[y]++; cols[x]++; }
    }
  }
  const minRow = Math.max(2, Math.round(w * 0.003)), minCol = Math.max(2, Math.round(h * 0.003));
  let top = 0; while (top < h && rows[top] < minRow) top++;
  if (top >= h) return null;
  let bottom = h - 1; while (bottom > top && rows[bottom] < minRow) bottom--;
  let left = 0; while (left < w && cols[left] < minCol) left++;
  let right = w - 1; while (right > left && cols[right] < minCol) right--;
  return { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
}

async function encodeUnder(c: AnyCanvas, maxBytes: number) {
  const first = await encodeJpeg(c, 0.92);
  if (first.size <= maxBytes) return { blob: first, fits: true };
  let lo = 0.4, hi = 0.92, fit: Blob | null = null;
  for (let k = 0; k < 6; k++) {
    const q = (lo + hi) / 2;
    const b = await encodeJpeg(c, q);
    if (b.size <= maxBytes) { fit = b; lo = q; } else hi = q;
  }
  if (fit) return { blob: fit, fits: true };
  const floor = await encodeJpeg(c, 0.4);
  return { blob: floor, fits: floor.size <= maxBytes };
}

function flag(r: ProcessResult, level: "check" | "fail", msg: string) {
  r.issues.push(msg);
  if (level === "fail") r.status = "fail";
  else if (r.status === "pass") r.status = "check";
}

export async function processImage(file: Blob, s: ProcessSettings): Promise<ProcessResult> {
  const r: ProcessResult = { status: "pass", issues: [], inW: 0, inH: 0, background: "" };
  if (file.size > LIMITS.maxBytes) {
    flag(r, "fail", "Larger than 30 MB. Export a smaller copy and try again.");
    return r;
  }
  let src: ImageBitmap;
  try { src = await decode(file); }
  catch { flag(r, "fail", "Couldn’t read this image. It may be damaged or in an unsupported format."); return r; }

  const w = src.width, h = src.height;
  r.inW = w; r.inH = h;
  if ((w * h) / 1e6 > LIMITS.maxMegapixels) {
    src.close();
    flag(r, "fail", `${Math.round((w * h) / 1e6)} MP is over the ${LIMITS.maxMegapixels} MP limit. Resize it first.`);
    return r;
  }

  const work = makeCanvas(w, h);
  const ctx = ctx2d(work, true);
  ctx.fillStyle = "#FFFFFF"; // transparent cutouts land on white
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(src, 0, 0);
  src.close();

  let img: ImageData | null = ctx.getImageData(0, 0, w, h);
  const edge = edgeStats(img.data, w, h, s.tolerance);

  if (edge.near < 0.6) {
    release(work);
    r.background = "Not white";
    flag(r, "fail", "Background isn’t white or light. It needs background removal, which this tool doesn’t do yet. Reshoot on white, or send it to us to fix.");
    return r;
  }
  if (s.clean && edge.pure < 0.98) {
    cleanBackground(img.data, w, h, s.tolerance);
    ctx.putImageData(img, 0, 0);
    r.background = "Cleaned to 255, 255, 255";
  } else if (edge.pure >= 0.98) {
    r.background = "255, 255, 255";
  } else {
    r.background = "Near white";
    if (s.presetKey !== "custom") flag(r, "check", "Background is near-white, not pure white. Turn on “Make near-white backgrounds pure white”.");
  }

  const box = productBox(img.data, w, h, r.background === "Near white" ? s.tolerance : 250);
  img = null;
  if (!box) {
    release(work);
    flag(r, "fail", "Couldn’t find a product: the photo looks almost entirely white.");
    return r;
  }
  if (box.x <= 2 || box.y <= 2 || box.x + box.w >= w - 2 || box.y + box.h >= h - 2) {
    flag(r, "check", "Product touches the photo’s edge, so part of it may be cut off. Check the original shot.");
  }

  const S = s.size;
  const scale = (S * s.fill) / Math.max(box.w, box.h);
  const dw = Math.round(box.w * scale), dh = Math.round(box.h * scale);
  const dx = Math.round((S - dw) / 2), dy = Math.round((S - dh) / 2);
  if (scale > 1.5) {
    flag(r, "check", `Enlarged ${scale.toFixed(1)}× from a ${Math.max(box.w, box.h)} px product area, so it may look soft. A sharper, closer photo will help.`);
  }
  if (Math.max(w, h) < s.minSide) {
    flag(r, "check", `Original is ${Math.max(w, h)} px on its longest side, under the ${s.minSide} px minimum. The output meets the size, but detail can’t be added.`);
  }

  const out = makeCanvas(S, S);
  const o = ctx2d(out);
  o.fillStyle = "#FFFFFF";
  o.fillRect(0, 0, S, S);
  o.imageSmoothingEnabled = true;
  o.imageSmoothingQuality = "high";
  o.drawImage(work as CanvasImageSource, box.x, box.y, box.w, box.h, dx, dy, dw, dh);
  release(work);

  const enc = await encodeUnder(out, s.maxBytes);
  release(out);
  if (!enc.fits) {
    flag(r, "check", `Still ${Math.round(enc.blob.size / 1024)} KB at the lowest quality we allow. Lower the output size or raise the limit.`);
  }
  r.blob = enc.blob;
  r.outKB = Math.round(enc.blob.size / 1024);
  r.size = S;
  r.box = { x: dx, y: dy, w: dw, h: dh };
  r.fillPct = Math.round((Math.max(dw, dh) / S) * 100);
  r.target = s.fill;
  return r;
}

/** Small preview for the file grid (before processing). */
export async function makeThumb(file: Blob, edge = 320): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, edge / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
    const c = makeCanvas(w, h);
    const ctx = ctx2d(c);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const b = await encodeJpeg(c, 0.8);
    release(c);
    return b;
  } catch {
    return null;
  }
}

/**
 * Draws a template onto a canvas. The same function renders the on-screen preview and the
 * exported file, so what you see is what you download.
 */
import { FONT_STACK } from "@/lib/fonts";
import { FORMATS, type El, type Template } from "./types";
import type { DesignState } from "./state";

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type Drawable = ImageBitmap | HTMLImageElement | HTMLCanvasElement;
export interface Assets { images: Record<string, Drawable | undefined>; logo?: Drawable }

export const LINE_HEIGHT = 1.15;

/**
 * Wraps text to a width, honouring line breaks, breaking over-long words and ending with "…"
 * when it runs past maxLines. `measure` is injected so this stays pure and unit-testable.
 */
export function wrapText(text: string, maxW: number, measure: (s: string) => number, maxLines: number): string[] {
  const lines: string[] = [];
  const push = (l: string) => { lines.push(l); return lines.length >= maxLines; };
  outer: for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const cand = line ? `${line} ${word}` : word;
      if (measure(cand) <= maxW) { line = cand; continue; }
      if (line && push(line)) break outer;
      line = "";
      // A single word wider than the box is broken by characters.
      let chunk = "";
      for (const ch of word) {
        if (measure(chunk + ch) > maxW && chunk) { if (push(chunk)) break outer; chunk = ""; }
        chunk += ch;
      }
      line = chunk;
    }
    if (push(line)) break;
  }
  const consumed = lines.join(" ").replace(/\s+/g, "").length;
  const total = text.replace(/\s+/g, "").length;
  if (consumed < total && lines.length) {
    let last = lines[lines.length - 1];
    while (last && measure(`${last}…`) > maxW) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (r > 0 && "roundRect" in ctx) (ctx as CanvasRenderingContext2D).roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** Fits a source into a box: "contain" shows all of it, "cover" fills the box and trims the overflow. */
export function fitRect(srcW: number, srcH: number, box: { x: number; y: number; w: number; h: number }, fit: "cover" | "contain") {
  const scale = fit === "cover" ? Math.max(box.w / srcW, box.h / srcH) : Math.min(box.w / srcW, box.h / srcH);
  const w = srcW * scale, h = srcH * scale;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

const sizeOf = (d: Drawable) => ("naturalWidth" in d ? { w: d.naturalWidth, h: d.naturalHeight } : { w: d.width, h: d.height });

function drawElement(ctx: Ctx, e: El, s: DesignState, a: Assets, W: number, H: number) {
  switch (e.type) {
    case "rect": {
      ctx.fillStyle = s.palette[e.fill];
      roundRect(ctx, e.x * W, e.y * H, e.w * W, e.h * H, (e.radius ?? 0) * W);
      ctx.fill();
      return;
    }
    case "image":
    case "logo": {
      const src = e.type === "image" ? a.images[e.id] : a.logo;
      if (!src) return;
      const box = { x: e.x * W, y: e.y * H, w: e.w * W, h: e.h * H };
      const { w, h } = sizeOf(src);
      const fit = e.type === "image" ? s.fits[e.id] ?? e.fit : "contain";
      const r = fitRect(w, h, box, fit);
      ctx.save();
      roundRect(ctx, box.x, box.y, box.w, box.h, e.type === "image" ? (e.radius ?? 0) * W : 0);
      ctx.clip();
      ctx.drawImage(src, r.x, r.y, r.w, r.h);
      ctx.restore();
      return;
    }
    case "text": {
      const px = Math.max(8, Math.round(e.size * W * (s.scale[e.id] ?? 1)));
      ctx.font = `${e.weight} ${px}px ${FONT_STACK}`;
      ctx.fillStyle = s.palette[e.color];
      ctx.textBaseline = "top";
      ctx.textAlign = e.align;
      const x = e.align === "left" ? e.x * W : e.align === "right" ? (e.x + e.w) * W : (e.x + e.w / 2) * W;
      const lines = wrapText(s.texts[e.id] ?? "", e.w * W, t => ctx.measureText(t).width, e.maxLines);
      lines.forEach((l, i) => ctx.fillText(l, x, e.y * H + i * px * LINE_HEIGHT));
      return;
    }
  }
}

/** Renders the whole design at `scale` × its native size (1 for export). */
export function renderTemplate(ctx: Ctx, t: Template, s: DesignState, a: Assets, scale = 1) {
  const { w, h } = FORMATS[t.format];
  const W = w * scale, H = h * scale;
  ctx.save();
  ctx.fillStyle = s.palette.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = "high";
  for (const e of t.elements) drawElement(ctx, e, s, a, W, H);
  ctx.restore();
}

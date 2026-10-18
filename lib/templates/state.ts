/** What the user has changed in a template, with undo and redo. Pure, so it is unit-tested. */
import type { Palette, PaletteKey, Template } from "./types";

export interface DesignState {
  texts: Record<string, string>;
  /** Per-text size multiplier, 0.5–1.5. */
  scale: Record<string, number>;
  palette: Palette;
  fits: Record<string, "cover" | "contain">;
}

export const SCALE_RANGE = [0.5, 1.5] as const;
const HEX = /^#[0-9a-f]{6}$/i;
const PALETTE_KEYS: PaletteKey[] = ["bg", "ink", "accent", "soft"];

export function initialState(t: Template): DesignState {
  const texts: Record<string, string> = {}, scale: Record<string, number> = {}, fits: Record<string, "cover" | "contain"> = {};
  for (const e of t.elements) {
    if (e.type === "text") { texts[e.id] = e.text; scale[e.id] = 1; }
    if (e.type === "image") fits[e.id] = e.fit;
  }
  return { texts, scale, palette: { ...t.palette }, fits };
}

/** Accepts a stored draft only if it fits this template; unknown or malformed fields fall back to the template. */
export function restoreDraft(t: Template, raw: unknown): DesignState | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<Record<keyof DesignState, unknown>>;
  const base = initialState(t);
  const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
  for (const id of Object.keys(base.texts)) {
    const v = obj(d.texts)[id];
    if (typeof v === "string") base.texts[id] = v.slice(0, 300);
    const sc = obj(d.scale)[id];
    if (typeof sc === "number" && sc >= SCALE_RANGE[0] && sc <= SCALE_RANGE[1]) base.scale[id] = sc;
  }
  for (const k of PALETTE_KEYS) { const v = obj(d.palette)[k]; if (typeof v === "string" && HEX.test(v)) base.palette[k] = v; }
  for (const id of Object.keys(base.fits)) { const v = obj(d.fits)[id]; if (v === "cover" || v === "contain") base.fits[id] = v; }
  return base;
}

/** Brand colours fill the palette in order: accent, text, background, panel. The shop name fills the shop-name texts. */
export function withBrand(t: Template, s: DesignState, colors: string[], shopName: string): DesignState {
  const palette = { ...s.palette };
  (["accent", "ink", "bg", "soft"] as PaletteKey[]).forEach((k, i) => { if (colors[i] && HEX.test(colors[i])) palette[k] = colors[i].toUpperCase(); });
  const texts = { ...s.texts };
  if (shopName.trim()) for (const e of t.elements) if (e.type === "text" && e.shop) texts[e.id] = shopName.trim().slice(0, 300);
  return { ...s, palette, texts };
}

export interface History { past: DesignState[]; present: DesignState; future: DesignState[]; lastKey: string | null }
export type Action =
  | { type: "set"; patch: Partial<DesignState>; key?: string }
  | { type: "undo" } | { type: "redo" } | { type: "reset"; state: DesignState };

export const HISTORY_LIMIT = 50;

/** Edits with the same `key` in a row (typing in one field) merge into one undo step. */
export function historyReducer(h: History, a: Action): History {
  switch (a.type) {
    case "set": {
      const next = { ...h.present, ...a.patch };
      if (a.key && a.key === h.lastKey) return { ...h, present: next, future: [] };
      return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: [], lastKey: a.key ?? null };
    }
    case "undo":
      if (!h.past.length) return h;
      return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], lastKey: null };
    case "redo":
      if (!h.future.length) return h;
      return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), lastKey: null };
    case "reset":
      return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: a.state, future: [], lastKey: null };
  }
}

export const startHistory = (s: DesignState): History => ({ past: [], present: s, future: [], lastKey: null });

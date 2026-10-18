import type { ProcessResult, Status } from "@/lib/image/engine";
import { MARKETPLACES, PRESETS, isPresetKey, type PresetKey } from "@/lib/presets";
import { sameShape } from "@/lib/storage";

export type ItemState = "loading" | "ready" | "processing" | "done";
export interface Item {
  id: number; file: File; name: string; inKB: number;
  thumb?: string; state: ItemState; result?: ProcessResult; outUrl?: string; output?: string;
  /** Results for the extra marketplaces in the same run, keyed by preset. */
  extras?: Partial<Record<PresetKey, { result: ProcessResult; output?: string }>>;
}
export interface Settings { presetKey: PresetKey; size: string; fill: string; maxKB: string; pattern: string; clean: boolean; extras: PresetKey[] }
export type Phase = "idle" | "running" | "done";

export const LABEL: Record<Status, string> = { pass: "Pass", check: "Check", fail: "Fail" };

export function fromPreset(key: PresetKey, extras: PresetKey[] = []): Settings {
  const p = PRESETS[key];
  return { presetKey: key, size: String(p.size), fill: String(p.fill), maxKB: String(p.maxKB), pattern: p.pattern, clean: p.clean, extras: extras.filter(k => k !== key) };
}

const shapeOf = sameShape(fromPreset("amazon"));

/** Accepts stored product-photo settings only if the preset and extras are real marketplaces. */
export function validateProductSettings(v: unknown): Settings | null {
  const f = shapeOf(v);
  if (!f || !isPresetKey(f.presetKey)) return null;
  const extras = f.extras.filter((k): k is PresetKey => MARKETPLACES.some(p => p.key === k));
  return { ...f, extras };
}

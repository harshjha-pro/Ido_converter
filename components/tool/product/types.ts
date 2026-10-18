import type { ProcessResult, Status } from "@/lib/image/engine";
import { PRESETS, type PresetKey } from "@/lib/presets";

export type ItemState = "loading" | "ready" | "processing" | "done";
export interface Item {
  id: number; file: File; name: string; inKB: number;
  thumb?: string; state: ItemState; result?: ProcessResult; outUrl?: string; output?: string;
}
export interface Settings { presetKey: PresetKey; size: string; fill: string; maxKB: string; pattern: string; clean: boolean }
export type Phase = "idle" | "running" | "done";

export const LABEL: Record<Status, string> = { pass: "Pass", check: "Check", fail: "Fail" };

export function fromPreset(key: PresetKey): Settings {
  const p = PRESETS[key];
  return { presetKey: key, size: String(p.size), fill: String(p.fill), maxKB: String(p.maxKB), pattern: p.pattern, clean: p.clean };
}

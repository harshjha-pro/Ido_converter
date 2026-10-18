/** Pure helpers for planning a product-photo run across several marketplaces. Unit-tested. */
import { MARKETPLACES, PRESETS, type PresetKey } from "@/lib/presets";
import type { ProcessSettings } from "./engine";

/** Engine settings for a preset at its published defaults (used for the extra marketplaces in a run). */
export function presetDefaults(key: PresetKey): ProcessSettings {
  const p = PRESETS[key];
  return { presetKey: key, size: p.size, fill: p.fill / 100, maxBytes: p.maxKB * 1024, clean: p.clean, tolerance: p.tolerance, minSide: p.minSide };
}

/** The extra marketplaces actually used: real marketplaces only, never the main one, in display order, no duplicates. */
export function extraKeys(primary: PresetKey, extras: readonly PresetKey[]): PresetKey[] {
  return MARKETPLACES.map(p => p.key).filter(k => k !== primary && extras.includes(k));
}

/** ZIP file name: the marketplace's folder for one, a neutral name when the ZIP holds several. */
export function zipName(primaryFolder: string, extraCount: number): string {
  return extraCount ? "idoconverter-product-photos.zip" : `idoconverter-${primaryFolder}.zip`;
}

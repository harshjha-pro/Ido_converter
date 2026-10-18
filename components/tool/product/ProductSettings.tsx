"use client";
import { Checkbox, NumberField, TextField } from "@/components/ui/Field";
import { PRESETS, type PresetKey } from "@/lib/presets";
import type { Settings } from "./types";
import s from "../workbench.module.css";

interface Props { settings: Settings; disabled: boolean; onPreset: (k: PresetKey) => void; update: (p: Partial<Settings>) => void }

export function ProductSettings({ settings, disabled, onPreset, update }: Props) {
  const preset = PRESETS[settings.presetKey];
  return (
    <aside className={`${s.panel} ${s.sticky}`} aria-labelledby="set-h">
      <div className={s.panelSection}>
        <h2 id="set-h">Marketplace</h2>
        <div className={s.presets} role="radiogroup" aria-labelledby="set-h">
          {(Object.keys(PRESETS) as PresetKey[]).map(k => {
            const p = PRESETS[k];
            return (
              <label key={k} className={s.preset}>
                <input type="radio" name="preset" value={k} checked={settings.presetKey === k} disabled={disabled} onChange={() => onPreset(k)} />
                <span className={s.t}>{p.label}</span>
                <span className={s.d}>{p.sub}{p.verification === "unverified" ? " · Unverified rules" : ""}</span>
              </label>
            );
          })}
        </div>
        <p className={s.source}>{preset.source}{preset.checkedOn ? ` Last checked ${preset.checkedOn}.` : ""}</p>
      </div>
      <div className={`${s.panelSection} ${s.fields}`}>
        <NumberField label="Output size" unit="px" min={500} max={5000} step={100} value={settings.size} disabled={disabled}
          onChange={v => update({ size: v })} hint={`Square. Minimum for ${preset.label}: ${preset.minSide.toLocaleString("en-IN")} px.`} />
        <NumberField label="Product fills" unit="%" min={50} max={98} value={settings.fill} disabled={disabled}
          onChange={v => update({ fill: v })} hint="Share of the frame the product’s longest side takes." />
        <NumberField label="Max file size" unit="KB" min={100} max={20000} step={100} value={settings.maxKB} disabled={disabled}
          onChange={v => update({ maxKB: v })} hint="We lower JPEG quality until each photo fits." />
        <TextField label="File names" value={settings.pattern} disabled={disabled} onChange={v => update({ pattern: v })}
          hint="{name} = original name, {n} = 001, 002…" />
        <Checkbox label="Make near-white backgrounds pure white" checked={settings.clean} disabled={disabled} onChange={v => update({ clean: v })} />
      </div>
    </aside>
  );
}

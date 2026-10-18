"use client";
/* eslint-disable @next/next/no-img-element -- the logo preview is a local blob: URL of the user's own file */
import { useEffect, useId, useState } from "react";
import { TextButton } from "@/components/ui/Button";
import { ColorField, NumberField, TextField } from "@/components/ui/Field";
import type { OutFormat } from "@/lib/image/convert";
import { acceptImages } from "@/lib/image/files";
import { ANCHORS, type Anchor } from "@/lib/image/watermark";
import { WM_LIMITS, type WatermarkForm } from "@/lib/image/watermarkForm";
import s from "../workbench.module.css";

const FORMATS: [OutFormat, string][] = [["keep", "Keep format"], ["image/jpeg", "JPG"], ["image/png", "PNG"], ["image/webp", "WebP"]];
const ANCHOR_LABEL: Record<Anchor, string> = {
  "top-left": "Top left", top: "Top", "top-right": "Top right", left: "Left", center: "Centre", right: "Right",
  "bottom-left": "Bottom left", bottom: "Bottom", "bottom-right": "Bottom right",
};

interface Props {
  form: WatermarkForm; disabled: boolean; update: (p: Partial<WatermarkForm>) => void;
  logo: File | null; onLogo: (f: File | null) => void;
  /** Optional shortcut to a saved brand logo. */
  brandLogo?: { file: File; onUse: () => void } | null;
}

export function WatermarkSettings({ form, disabled, update, logo, onLogo, brandLogo }: Props) {
  const logoId = useId();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  useEffect(() => {
    if (!logo) { setLogoUrl(null); return; }
    const u = URL.createObjectURL(logo);
    setLogoUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [logo]);

  const pickLogo = async (list: FileList | null) => {
    if (!list?.length) return;
    const { accepted } = await acceptImages([list[0]]);
    if (!accepted.length) { setLogoError("That file isn’t a JPG, PNG or WebP image."); return; }
    setLogoError("");
    onLogo(accepted[0]);
  };

  return (
    <aside className={`${s.panel} ${s.sticky}`} aria-labelledby="wm-set">
      <div className={s.panelSection}>
        <h2 id="wm-set">Watermark</h2>
        <div className={s.presets} role="radiogroup" aria-labelledby="wm-set">
          <label className={s.preset}>
            <input type="radio" name="wm-kind" checked={form.kind === "text"} disabled={disabled} onChange={() => update({ kind: "text" })} />
            <span className={s.t}>Text</span><span className={s.d}>Your shop name, website or ©</span>
          </label>
          <label className={s.preset}>
            <input type="radio" name="wm-kind" checked={form.kind === "logo"} disabled={disabled} onChange={() => update({ kind: "logo" })} />
            <span className={s.t}>Logo</span><span className={s.d}>A PNG with transparency works best</span>
          </label>
        </div>
      </div>

      <div className={`${s.panelSection} ${s.fields}`}>
        {form.kind === "text" ? (
          <>
            <TextField label="Text" value={form.text} disabled={disabled} onChange={v => update({ text: v.slice(0, 100) })} hint="Up to 100 characters." />
            <ColorField label="Text colour" value={form.color} disabled={disabled} onChange={v => update({ color: v })} />
            <NumberField label="Text size" unit="%" min={WM_LIMITS.textSize[0]} max={WM_LIMITS.textSize[1]} value={form.textSize} disabled={disabled}
              onChange={v => update({ textSize: v })} hint="Height of the letters, as a share of the image’s shorter side." />
          </>
        ) : (
          <>
            <div className={s.fields}>
              <span className={s.groupLabel} id={`${logoId}-l`}>Logo</span>
              {logo && logoUrl ? (
                <div className={s.logoRow}>
                  <span className={s.logoThumb}><img src={logoUrl} alt="" /></span>
                  <span className={s.name} title={logo.name}>{logo.name}</span>
                  <TextButton disabled={disabled} onClick={() => onLogo(null)} aria-label={`Remove logo ${logo.name}`}>Remove</TextButton>
                </div>
              ) : (
                <label className={`${s.drop} ${s.dropCompact}`} htmlFor={logoId}>
                  <input id={logoId} type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} aria-describedby={`${logoId}-l`}
                    onChange={e => { pickLogo(e.target.files); e.target.value = ""; }} />
                  <strong>Choose a logo</strong><span className={s.sub}>JPG, PNG or WebP</span>
                </label>
              )}
              {brandLogo && !logo && <TextButton className={s.start} disabled={disabled} onClick={brandLogo.onUse}>Use my brand kit logo</TextButton>}
              {logoError && <span className={s.errorText} role="alert">{logoError}</span>}
            </div>
            <NumberField label="Logo width" unit="%" min={WM_LIMITS.logoSize[0]} max={WM_LIMITS.logoSize[1]} value={form.logoSize} disabled={disabled}
              onChange={v => update({ logoSize: v })} hint="As a share of each image’s width." />
          </>
        )}

        <NumberField label="Opacity" unit="%" min={WM_LIMITS.opacity[0]} max={WM_LIMITS.opacity[1]} value={form.opacity} disabled={disabled}
          onChange={v => update({ opacity: v })} hint="Lower is more see-through. 40–70% is usually enough." />

        <fieldset className={`${s.bare} ${s.fields}`}>
          <legend className={s.groupLabel}>Position</legend>
          <div className={s.posGrid} role="group" aria-label="Watermark position">
            {ANCHORS.map(a => (
              <button key={a} type="button" aria-pressed={form.placement === a} aria-label={ANCHOR_LABEL[a]} title={ANCHOR_LABEL[a]} disabled={disabled}
                onClick={() => update({ placement: a })}><span aria-hidden="true" /></button>
            ))}
          </div>
          <div className={s.segWrap} role="group" aria-label="Repeat">
            <button type="button" aria-pressed={form.placement === "tile"} disabled={disabled} onClick={() => update({ placement: "tile" })}>Repeat across the image</button>
          </div>
          {form.placement !== "center" && (
            <NumberField label="Margin" unit="%" min={WM_LIMITS.margin[0]} max={WM_LIMITS.margin[1]} value={form.margin} disabled={disabled}
              onChange={v => update({ margin: v })} hint="Space from the edges, as a share of the shorter side." />
          )}
        </fieldset>

        <fieldset className={`${s.bare} ${s.fields}`}>
          <legend className={s.groupLabel}>Save as</legend>
          <div className={s.segWrap} role="group" aria-label="Output format">
            {FORMATS.map(([v, l]) => (
              <button key={v} type="button" aria-pressed={form.format === v} disabled={disabled} onClick={() => update({ format: v })}>{l}</button>
            ))}
          </div>
          {form.format !== "image/png" && (
            <NumberField label="Quality" unit="%" min={WM_LIMITS.quality[0]} max={WM_LIMITS.quality[1]} value={form.quality} disabled={disabled}
              onChange={v => update({ quality: v })} hint="Applies to JPG and WebP; PNG is lossless." />
          )}
        </fieldset>
        <TextField label="File names" value={form.pattern} disabled={disabled} onChange={v => update({ pattern: v })} hint="{name} = original name, {n} = 001, 002…" />
      </div>
    </aside>
  );
}

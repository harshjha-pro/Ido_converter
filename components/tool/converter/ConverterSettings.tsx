"use client";
import { Checkbox, ColorField, NumberField, TextField } from "@/components/ui/Field";
import type { OutFormat, ResizeMode, Rotation } from "@/lib/image/convert";
import { SHAPES, validateConverterForm, type Background, type ConverterForm } from "@/lib/image/converterForm";
import { SavedSettings } from "../SavedSettings";
import s from "../workbench.module.css";

const FORMATS: [OutFormat, string, string][] = [
  ["image/jpeg", "JPG", "Photos, smallest files"], ["image/png", "PNG", "Graphics, keeps transparency"],
  ["image/webp", "WebP", "Websites, small with transparency"], ["keep", "Keep format", "Same type as each original"],
];
const RESIZES: [ResizeMode, string][] = [["none", "Keep size"], ["longest", "Longest side"], ["width", "Width"], ["height", "Height"]];
const BACKGROUNDS: [Background, string][] = [["white", "White"], ["black", "Black"], ["transparent", "Transparent"], ["custom", "Colour"]];

interface Props { form: ConverterForm; disabled: boolean; update: (p: Partial<ConverterForm>) => void }

export function ConverterSettings({ form, disabled, update }: Props) {
  const pngOnly = form.format === "image/png";
  const jpgOnly = form.format === "image/jpeg";
  const shaped = form.shape !== "original";
  return (
    <aside className={`${s.panel} ${s.sticky}`} aria-labelledby="cv-set">
      <SavedSettings tool="converter" current={form} validate={validateConverterForm} onApply={update} disabled={disabled} />
      <div className={s.panelSection}>
        <h2 id="cv-set">Convert to</h2>
        <div className={s.presets} role="radiogroup" aria-labelledby="cv-set">
          {FORMATS.map(([v, l, d]) => (
            <label key={v} className={s.preset}>
              <input type="radio" name="cv-format" checked={form.format === v} disabled={disabled} onChange={() => update({ format: v })} />
              <span className={s.t}>{l}</span><span className={s.d}>{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={`${s.panelSection} ${s.fields}`}>
        <NumberField label="Quality" unit="%" min={10} max={100} value={form.quality} disabled={disabled || pngOnly}
          onChange={v => update({ quality: v })} hint={pngOnly ? "PNG is lossless, so quality doesn’t apply." : "Lower means smaller files. 75–85% suits most photos."} />

        <fieldset className={`${s.bare} ${s.fields}`}>
          <legend className={s.groupLabel}>Shape</legend>
          <div className={s.segWrap} role="group" aria-label="Aspect ratio">
            {SHAPES.map(([v, l]) => (
              <button key={v} type="button" aria-pressed={form.shape === v} disabled={disabled} onClick={() => update({ shape: v })}>{l}</button>
            ))}
          </div>
          {form.shape === "custom" && (
            <div className={s.pair}>
              <NumberField label="Ratio width" min={1} max={10000} value={form.ratioW} disabled={disabled} onChange={v => update({ ratioW: v })} />
              <NumberField label="Ratio height" min={1} max={10000} value={form.ratioH} disabled={disabled} onChange={v => update({ ratioH: v })} />
            </div>
          )}
          {shaped && (
            <>
              <div className={s.presets} role="radiogroup" aria-label="How to fit">
                <label className={s.preset}>
                  <input type="radio" name="cv-fit" checked={form.fit === "crop"} disabled={disabled} onChange={() => update({ fit: "crop" })} />
                  <span className={s.t}>Crop to fit</span><span className={s.d}>Trims the edges, keeps the centre</span>
                </label>
                <label className={s.preset}>
                  <input type="radio" name="cv-fit" checked={form.fit === "pad"} disabled={disabled} onChange={() => update({ fit: "pad" })} />
                  <span className={s.t}>Add padding</span><span className={s.d}>Keeps the whole image, centred</span>
                </label>
              </div>
              <p className={s.hintText}>For an exact size such as 1200 × 628, pick Custom, enter those numbers, and resize by width to 1200.</p>
            </>
          )}
        </fieldset>

        <fieldset className={`${s.bare} ${s.fields}`}>
          <legend className={s.groupLabel}>Background</legend>
          <div className={s.segWrap} role="group" aria-label="Background colour">
            {BACKGROUNDS.map(([v, l]) => (
              <button key={v} type="button" aria-pressed={form.background === v} disabled={disabled || (v === "transparent" && jpgOnly)} onClick={() => update({ background: v })}>{l}</button>
            ))}
          </div>
          {form.background === "custom" && <ColorField label="Custom colour" value={form.color} disabled={disabled} onChange={v => update({ color: v })} />}
          <p className={s.hintText}>
            {jpgOnly ? "Fills padding and any transparent areas. JPG can’t be transparent." : "Fills padding and any transparent areas. Transparent keeps them see-through."}
          </p>
        </fieldset>

        <fieldset className={`${s.bare} ${s.fields}`}>
          <legend className={s.groupLabel}>Resize</legend>
          <div className={s.presets}>
            {RESIZES.map(([v, l]) => (
              <label key={v} className={s.preset}>
                <input type="radio" name="cv-resize" checked={form.resize === v} disabled={disabled} onChange={() => update({ resize: v })} />
                <span className={s.t}>{l}</span>
              </label>
            ))}
          </div>
          {form.resize !== "none" && (
            <>
              <NumberField label={form.resize === "longest" ? "Longest side" : form.resize === "width" ? "Width" : "Height"} unit="px" min={16} max={10000}
                value={form.px} disabled={disabled} onChange={v => update({ px: v })} hint={shaped ? "The other side follows the shape you chose." : "The other side follows the original proportions."} />
              <Checkbox label="Don’t enlarge smaller images" checked={form.noEnlarge} disabled={disabled} onChange={v => update({ noEnlarge: v })} />
            </>
          )}
        </fieldset>

        <fieldset className={s.bare}>
          <legend className={s.groupLabel}>Rotate</legend>
          <div className={`${s.seg} ${s.segFlush}`} role="group" aria-label="Rotate clockwise">
            {([0, 90, 180, 270] as Rotation[]).map(r => (
              <button key={r} type="button" aria-pressed={form.rotate === r} disabled={disabled} onClick={() => update({ rotate: r })}>{r}°</button>
            ))}
          </div>
        </fieldset>
        <Checkbox label="Flip horizontally (mirror)" checked={form.flipH} disabled={disabled} onChange={v => update({ flipH: v })} />
        <Checkbox label="Flip vertically" checked={form.flipV} disabled={disabled} onChange={v => update({ flipV: v })} />
        <TextField label="File names" value={form.pattern} disabled={disabled} onChange={v => update({ pattern: v })} hint="{name} = original name, {n} = 001, 002…" />
      </div>
    </aside>
  );
}

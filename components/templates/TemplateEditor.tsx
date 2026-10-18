"use client";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { Checkbox, ColorField } from "@/components/ui/Field";
import { Toast, type ToastData } from "@/components/ui/Feedback";
import { useBrandKit } from "@/components/brand/useBrandKit";
import { isEmptyKit } from "@/lib/brandKit";
import { acceptImages, formatKB, saveBlob } from "@/lib/image/files";
import { readJson, removeKey, writeJson } from "@/lib/storage";
import { renderTemplate } from "@/lib/templates/render";
import { SCALE_RANGE, historyReducer, initialState, restoreDraft, startHistory, withBrand, type DesignState } from "@/lib/templates/state";
import { FORMATS, PALETTE_LABEL, type PaletteKey, type Template } from "@/lib/templates/types";
import { DesignCanvas } from "./DesignCanvas";
import { useLoadedImage } from "./useLoadedImage";
import w from "@/components/tool/workbench.module.css";
import s from "./templates.module.css";

const draftKey = (id: string) => `ido.template.${id}.v1`;

export function TemplateEditor({ template: t }: { template: Template }) {
  const id = useId();
  const [h, dispatch] = useReducer(historyReducer, t, tpl => startHistory(initialState(tpl)));
  const st = h.present;
  const [restored, setRestored] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const kit = useBrandKit();
  const booted = useRef(false);
  const closeToast = useCallback(() => setToast(null), []);

  // Restore the last draft for this template (text and colours only; photos are never stored).
  useEffect(() => {
    const d = restoreDraft(t, readJson(draftKey(t.id)));
    if (d && JSON.stringify(d) !== JSON.stringify(initialState(t))) { dispatch({ type: "reset", state: d }); setRestored(true); }
    booted.current = true;
  }, [t]);
  // Save the draft shortly after each change.
  useEffect(() => {
    if (!booted.current) return;
    const timer = setTimeout(() => writeJson(draftKey(t.id), st), 400);
    return () => clearTimeout(timer);
  }, [st, t.id]);
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  const photo = useLoadedImage(photoUrl ?? t.sample);
  const logo = useLoadedImage(showLogo ? kit.logo : null);
  const assets = useMemo(() => ({ images: { photo }, logo }), [photo, logo]);
  const hasPhotoSlot = t.elements.some(e => e.type === "image");
  const hasLogoSlot = t.elements.some(e => e.type === "logo");
  const fmt = FORMATS[t.format];

  const set = (patch: Partial<DesignState>, key?: string) => dispatch({ type: "set", patch, key });
  const pickPhoto = async (list: FileList | null) => {
    if (!list?.length) return;
    const { accepted } = await acceptImages([list[0]]);
    if (!accepted.length) { setPhotoError("That file isn’t a JPG, PNG or WebP image."); return; }
    setPhotoError("");
    setPhotoUrl(URL.createObjectURL(accepted[0]));
  };
  const resetAll = () => { dispatch({ type: "reset", state: initialState(t) }); removeKey(draftKey(t.id)); setRestored(false); };

  const download = async () => {
    setExporting(true);
    try {
      const c = document.createElement("canvas");
      c.width = fmt.w; c.height = fmt.h;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("canvas");
      renderTemplate(ctx, t, st, assets, 1);
      const blob = await new Promise<Blob>((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error("encode"))), format, 0.92));
      const name = `${t.id}.${format === "image/png" ? "png" : "jpg"}`;
      saveBlob(name, blob);
      setToast({ id: Date.now(), text: `Downloaded ${name} · ${fmt.w} × ${fmt.h} px · ${formatKB(Math.round(blob.size / 1024))}` });
    } catch {
      setToast({ id: Date.now(), text: "Couldn’t create the image. Try PNG, or reload the page." });
    } finally { setExporting(false); }
  };

  const texts = t.elements.filter((e): e is Extract<typeof e, { type: "text" }> => e.type === "text");
  return (
    <div className={s.editor}>
      <section className={s.stage} aria-label="Preview">
        <div className={`${s.stageInner} ${t.format === "story" || t.format === "portrait" ? s.tall : ""}`}>
          <DesignCanvas template={t} state={st} assets={assets} label={`Preview of your ${t.name.toLowerCase()} design`} />
        </div>
        <div className={s.toolbar}>
          <Button variant="secondary" size="small" disabled={!h.past.length} onClick={() => dispatch({ type: "undo" })}>Undo</Button>
          <Button variant="secondary" size="small" disabled={!h.future.length} onClick={() => dispatch({ type: "redo" })}>Redo</Button>
          <TextButton onClick={resetAll}>Reset to template</TextButton>
        </div>
        {restored && <p className={s.note} role="status">We restored your last edits to this template.</p>}
      </section>

      <aside className={s.panel} aria-label="Edit design">
        {!isEmptyKit(kit) && (
          <div className={s.section}>
            <h2>Brand kit</h2>
            <Button variant="secondary" size="small" onClick={() => dispatch({ type: "reset", state: withBrand(t, st, kit.colors, kit.name) })}>Use my brand kit</Button>
            <span className={s.note}>Applies your colours{kit.name ? " and shop name" : ""}. Undo if you don’t like it.</span>
          </div>
        )}

        {hasPhotoSlot && (
          <div className={s.section}>
            <h2>Photo</h2>
            <label className={`${w.drop} ${w.dropCompact}`} htmlFor={`${id}-photo`}>
              <input id={`${id}-photo`} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { pickPhoto(e.target.files); e.target.value = ""; }} />
              <strong>{photoUrl ? "Replace photo" : "Add your photo"}</strong><span className={w.sub}>JPG, PNG or WebP</span>
            </label>
            {photoError && <span className={w.errorText} role="alert">{photoError}</span>}
            {!photoUrl && t.sample && <span className={s.note}>Showing our sample photo. Add your own before you post.</span>}
            {photoUrl && <TextButton className={w.start} onClick={() => setPhotoUrl(null)}>Remove my photo</TextButton>}
            <div className={w.segWrap} role="group" aria-label="Photo fit">
              <button type="button" aria-pressed={st.fits.photo === "contain"} onClick={() => set({ fits: { ...st.fits, photo: "contain" } })}>Show whole photo</button>
              <button type="button" aria-pressed={st.fits.photo === "cover"} onClick={() => set({ fits: { ...st.fits, photo: "cover" } })}>Fill the frame</button>
            </div>
          </div>
        )}

        <div className={s.section}>
          <h2>Text</h2>
          {texts.map(e => (
            <div key={e.id} className={s.section}>
              <label className={w.groupLabel} htmlFor={`${id}-${e.id}`}>{e.label}</label>
              <textarea id={`${id}-${e.id}`} className={s.textarea} rows={Math.min(3, e.maxLines)} maxLength={300} value={st.texts[e.id] ?? ""}
                onChange={ev => set({ texts: { ...st.texts, [e.id]: ev.target.value } }, `text:${e.id}`)} />
              <label className={s.note} htmlFor={`${id}-${e.id}-size`}>Size {Math.round((st.scale[e.id] ?? 1) * 100)}%</label>
              <input id={`${id}-${e.id}-size`} className={s.range} type="range" min={SCALE_RANGE[0] * 100} max={SCALE_RANGE[1] * 100} step={5}
                value={Math.round((st.scale[e.id] ?? 1) * 100)} aria-label={`${e.label} size`}
                onChange={ev => set({ scale: { ...st.scale, [e.id]: Number(ev.target.value) / 100 } }, `size:${e.id}`)} />
            </div>
          ))}
          <span className={s.note}>Long text is shortened with “…” to keep the layout tidy.</span>
        </div>

        <div className={s.section}>
          <h2>Colours</h2>
          <div className={s.palette}>
            {(Object.keys(PALETTE_LABEL) as PaletteKey[]).map(k => (
              <ColorField key={k} label={PALETTE_LABEL[k]} value={st.palette[k].toUpperCase()} onChange={v => set({ palette: { ...st.palette, [k]: v } }, `color:${k}`)} />
            ))}
          </div>
        </div>

        {hasLogoSlot && (
          <div className={s.section}>
            <h2>Logo</h2>
            {kit.logo
              ? <Checkbox label="Show my brand kit logo" checked={showLogo} onChange={setShowLogo} />
              : <span className={s.note}>Add a logo to your <Link href="/brand-kit">brand kit</Link> to place it here.</span>}
          </div>
        )}

        <div className={s.section}>
          <h2>Download</h2>
          <div className={w.segWrap} role="group" aria-label="File type">
            <button type="button" aria-pressed={format === "image/png"} onClick={() => setFormat("image/png")}>PNG</button>
            <button type="button" aria-pressed={format === "image/jpeg"} onClick={() => setFormat("image/jpeg")}>JPG</button>
          </div>
          <Button onClick={download} disabled={exporting}>{exporting ? "Creating…" : `Download ${format === "image/png" ? "PNG" : "JPG"}`}</Button>
          <span className={s.note}>{fmt.label}, {fmt.w} × {fmt.h} px · {fmt.use}</span>
        </div>
      </aside>
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

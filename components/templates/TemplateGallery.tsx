"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TEMPLATES } from "@/lib/templates/catalog";
import { initialState } from "@/lib/templates/state";
import { CATEGORY_LABEL, FORMATS, type Category, type FormatKey, type Template } from "@/lib/templates/types";
import { DesignCanvas } from "./DesignCanvas";
import { useLoadedImage } from "./useLoadedImage";
import s from "./templates.module.css";

function Preview({ t }: { t: Template }) {
  const img = useLoadedImage(t.sample);
  const state = useMemo(() => initialState(t), [t]);
  const assets = useMemo(() => ({ images: { photo: img } }), [img]);
  return <DesignCanvas template={t} state={state} assets={assets} label={`${t.name} template preview`} className={t.format === "story" ? s.storyThumb : undefined} />;
}

export function TemplateGallery() {
  const [format, setFormat] = useState<FormatKey | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const shown = TEMPLATES.filter(t => (format === "all" || t.format === format) && (category === "all" || t.category === category));
  const usedCategories = [...new Set(TEMPLATES.map(t => t.category))];

  return (
    <>
      <div className={s.filters}>
        <div className={s.filterRow} role="group" aria-label="Size">
          <span className={s.filterLabel} aria-hidden="true">Size</span>
          <div className={s.chips}>
            {(["all", ...Object.keys(FORMATS)] as (FormatKey | "all")[]).map(f => (
              <button key={f} type="button" className={s.chip} aria-pressed={format === f} onClick={() => setFormat(f)}>{f === "all" ? "All sizes" : FORMATS[f].label}</button>
            ))}
          </div>
        </div>
        <div className={s.filterRow} role="group" aria-label="Purpose">
          <span className={s.filterLabel} aria-hidden="true">Purpose</span>
          <div className={s.chips}>
            {(["all", ...usedCategories] as (Category | "all")[]).map(c => (
              <button key={c} type="button" className={s.chip} aria-pressed={category === c} onClick={() => setCategory(c)}>{c === "all" ? "All" : CATEGORY_LABEL[c]}</button>
            ))}
          </div>
        </div>
      </div>
      <p className={s.count} role="status">{shown.length} template{shown.length === 1 ? "" : "s"}</p>
      {shown.length ? (
        <ul className={s.gallery} aria-label="Templates">
          {shown.map(t => (
            <li key={t.id} className={s.item}>
              <Preview t={t} />
              <h2><Link href={`/templates/${t.id}`}>{t.name}</Link></h2>
              <p>{FORMATS[t.format].label} · {FORMATS[t.format].w} × {FORMATS[t.format].h} px</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.count}>No templates match both filters. <button type="button" className={s.chip} onClick={() => { setFormat("all"); setCategory("all"); }}>Show all templates</button></p>
      )}
    </>
  );
}

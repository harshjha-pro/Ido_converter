"use client";
/* eslint-disable @next/next/no-img-element -- previews are local blob: URLs of the user's own files */
import { useEffect, useState, type Ref } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { formatKB } from "@/lib/image/files";
import type { Preset } from "@/lib/presets";
import { Overlay } from "../Overlay";
import { LABEL, type Item, type Phase } from "./types";
import s from "../workbench.module.css";

interface Props {
  item: Item | null; preset: Preset; phase: Phase; sheetOpen: boolean;
  closeRef: Ref<HTMLButtonElement>; onClose: () => void; onDownload: (item: Item) => void;
}

/** Details for one photo: before/after, measurements, and what to fix. A side panel on desktop, a sheet below 1100px. */
export function Inspector({ item, preset, phase, sheetOpen, closeRef, onClose, onDownload }: Props) {
  const [view, setView] = useState<"after" | "before">("after");
  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const id = item?.id;
  useEffect(() => { setView("after"); }, [id]);
  useEffect(() => {
    if (!item || view !== "before") { setOrigUrl(null); return; }
    const u = URL.createObjectURL(item.file);
    setOrigUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [item, view]);

  const r = item?.result;
  return (
    <aside
      className={`${s.panel} ${s.sticky} ${s.inspector} ${item ? "" : s.inspectorIdle}`}
      aria-labelledby="insp-h"
      role={sheetOpen ? "dialog" : undefined}
      aria-modal={sheetOpen ? true : undefined}
    >
      {!item ? (
        <>
          <h2 id="insp-h">Details</h2>
          <p className={s.inspEmpty}>
            {phase === "done" ? "Select a photo to see its measurements and what to fix." : "Process your photos to inspect each result here."}
          </p>
        </>
      ) : (
        <>
          <div className={s.inspHead}>
            <h2 id="insp-h">{item.name}</h2>
            <Button ref={closeRef} variant="secondary" size="small" className={s.closeBtn} onClick={onClose}>Close</Button>
          </div>
          {r && <div className={s.inspTag}><Tag tone={r.status}>{LABEL[r.status]}</Tag></div>}
          <div className={s.seg} role="group" aria-label="Compare">
            <button aria-pressed={view === "after" && !!r?.blob} disabled={!r?.blob} onClick={() => setView("after")}>After</button>
            <button aria-pressed={view === "before" || !r?.blob} onClick={() => setView("before")}>Before</button>
          </div>
          <div className={s.stage}>
            {view === "after" && r?.blob && item.outUrl ? (
              <>
                <img src={item.outUrl} alt={`Processed ${item.name}`} />
                <Overlay size={r.size!} box={r.box!} target={r.target!} detailed />
              </>
            ) : origUrl || item.thumb ? (
              <img src={origUrl ?? item.thumb} alt={`Original ${item.name}`} />
            ) : null}
          </div>
          {view === "after" && r?.blob && (
            <p className={s.legend}>Blue box: product. Dashed square: {Math.round((r.target ?? 0) * 100)}% target. Corners: frame edge.</p>
          )}
          {r && (
            <dl className={s.spec}>
              <dt>Background</dt><dd>{r.background || "—"}</dd>
              <dt>Product fill</dt><dd>{r.blob ? `${r.fillPct}% (target ${Math.round(r.target! * 100)}%)` : "—"}</dd>
              <dt>Size</dt><dd>{r.inW ? `${r.inW} × ${r.inH}` : "—"}{r.blob ? ` → ${r.size} × ${r.size} px` : ""}</dd>
              <dt>File size</dt><dd>{formatKB(item.inKB)}{r.blob ? ` → ${formatKB(r.outKB!)}` : ""}</dd>
              <dt>Saved as</dt><dd>{item.output ?? "Not included in the ZIP"}</dd>
            </dl>
          )}
          {r?.blob && item.output && (
            <TextButton onClick={() => onDownload(item)} aria-label={`Download ${item.output}`}>Download this photo</TextButton>
          )}
          <ul className={s.issues}>
            {r && r.issues.length === 0 && <li>Meets the {preset.label} rules we can measure. Still check for text, logos and focus yourself.</li>}
            {r?.issues.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </>
      )}
    </aside>
  );
}

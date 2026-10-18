"use client";
/* eslint-disable @next/next/no-img-element -- previews are local blob: URLs of the user's own files */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { Progress, Toast, type ToastData } from "@/components/ui/Feedback";
import { Tag } from "@/components/ui/Tag";
import { LIMITS } from "@/lib/config";
import { EXT, type ConvertResult } from "@/lib/image/convert";
import { runThumb } from "@/lib/image/client";
import { buildZip } from "@/lib/image/zip";
import { acceptImages, formatKB, outputName, saveBlob } from "@/lib/image/files";
import { useLeaveWarning } from "../useLeaveWarning";
import { focusAfterRemove } from "../focus";
import { DropZone } from "../DropZone";
import s from "../workbench.module.css";

interface Item { id: number; file: File; thumb?: string; state: "loading" | "ready" | "working" | "done"; result?: ConvertResult; outUrl?: string; output?: string }

export interface BatchWords {
  /** "Convert" → "Convert 3 images", "Convert again" */
  verb: string;
  /** "Converting" → "Converting 2 of 3…" */
  progressing: string;
  /** "ready to convert" → "3 images ready to convert" */
  ready: string;
  /** Folder and ZIP name, e.g. "idoconverter-converted" */
  zipName: string;
}

interface Props {
  words: BatchWords;
  /** The settings panel; `disabled` is true while a batch runs. */
  settings: (disabled: boolean) => ReactNode;
  /** Changes whenever a setting changes, so finished results are marked as out of date. */
  settingsKey: string;
  valid: boolean;
  /** Why the action is blocked when `valid` is false. */
  invalidReason?: string;
  pattern: string;
  process: (file: File) => Promise<ConvertResult>;
}

/**
 * The shared upload → settings → process → results → download screen used by the
 * converter and the watermark tool. Each tool supplies its settings panel and a
 * `process` function; everything else (limits, previews, stop, remove, ZIP) is common.
 */
export function BatchWorkbench({ words, settings, settingsKey, valid, invalidReason, pattern, process }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [done, setDone] = useState(0);
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const [zipping, setZipping] = useState(false);
  const idRef = useRef(0);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  const cancelRef = useRef(false);
  const closeToast = useCallback(() => setToast(null), []);
  useLeaveWarning(phase === "running");
  useEffect(() => () => { for (const it of itemsRef.current) { if (it.thumb) URL.revokeObjectURL(it.thumb); if (it.outUrl) URL.revokeObjectURL(it.outUrl); } }, []);

  // A settings change after a run means the results no longer match: offer to run again.
  const lastKey = useRef(settingsKey);
  useEffect(() => {
    if (lastKey.current !== settingsKey) { lastKey.current = settingsKey; setPhase(p => (p === "done" ? "idle" : p)); }
  }, [settingsKey]);

  const addFiles = async (incoming: File[]) => {
    if (phase === "running") return;
    const { accepted: ok } = await acceptImages(incoming);
    const room = LIMITS.maxFiles - itemsRef.current.length;
    const take = ok.slice(0, Math.max(0, room));
    const msgs: string[] = [];
    if (incoming.length - ok.length) msgs.push(`${incoming.length - ok.length} skipped: only JPG, PNG and WebP work (HEIC, GIF and SVG aren’t supported).`);
    if (ok.length > take.length) msgs.push(`${ok.length - take.length} not added: the limit is ${LIMITS.maxFiles} per batch.`);
    setNotice(msgs.join(" "));
    if (phase === "done") setPhase("idle");
    const fresh = take.map(f => ({ id: ++idRef.current, file: f, state: "loading" as const }));
    setItems(prev => [...prev, ...fresh]);
    for (const it of fresh) runThumb(it.file).then(b => {
      const url = b ? URL.createObjectURL(b) : undefined;
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, thumb: url, state: x.state === "loading" ? "ready" : x.state } : x));
    });
  };

  const remove = (id: number) => {
    const it = items.find(x => x.id === id);
    if (it?.thumb) URL.revokeObjectURL(it.thumb);
    if (it?.outUrl) URL.revokeObjectURL(it.outUrl);
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const run = async () => {
    if (!valid) return;
    const list = itemsRef.current;
    for (const it of list) if (it.outUrl) URL.revokeObjectURL(it.outUrl);
    setItems(prev => prev.map(x => ({ ...x, state: "ready", result: undefined, outUrl: undefined, output: undefined })));
    setPhase("running"); setDone(0); setNotice(""); cancelRef.current = false;
    const used = new Set<string>();
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      if (cancelRef.current) break;
      const it = list[i];
      if (!itemsRef.current.some(x => x.id === it.id)) continue;
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, state: "working" } : x));
      let result: ConvertResult;
      try { result = await process(it.file); }
      catch { result = { status: "fail", issues: ["Something went wrong with this image. Try it on its own."], inW: 0, inH: 0 }; }
      const output = result.blob ? outputName(pattern, it.file.name, i, used, EXT[result.outType ?? ""] ?? "img") : undefined;
      const outUrl = result.blob ? URL.createObjectURL(result.blob) : undefined;
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, state: "done", result, output, outUrl } : x));
      setDone(++n);
    }
    setPhase("done");
    if (cancelRef.current) setNotice(`Stopped after ${n} of ${list.length}.`);
  };

  const finished = items.filter(i => i.result?.blob);
  const startOver = () => {
    for (const it of items) { if (it.thumb) URL.revokeObjectURL(it.thumb); if (it.outUrl) URL.revokeObjectURL(it.outUrl); }
    setItems([]); setPhase("idle"); setNotice("");
  };
  const failed = items.filter(i => i.result?.status === "fail").length;
  const inKB = finished.reduce((a, i) => a + Math.round(i.file.size / 1024), 0);
  const outKB = finished.reduce((a, i) => a + Math.round((i.result?.blob?.size ?? 0) / 1024), 0);
  const loading = items.filter(i => i.state === "loading").length;

  const downloadZip = async () => {
    setZipping(true);
    try {
      const zip = await buildZip(finished.map(i => ({ name: `${words.zipName}/${i.output}`, blob: i.result!.blob! })));
      saveBlob(`${words.zipName}.zip`, zip);
      setToast({ id: Date.now(), text: `ZIP downloaded · ${finished.length} image${finished.length === 1 ? "" : "s"} · ${formatKB(Math.round(zip.size / 1024))}` });
    } catch { setToast({ id: Date.now(), text: "Couldn’t build the ZIP. Download images one by one or try a smaller batch." }); }
    finally { setZipping(false); }
  };

  const plural = (n: number) => `${n} image${n === 1 ? "" : "s"}`;
  let status = "";
  if (phase === "running") status = `${words.progressing} ${Math.min(done + 1, items.length)} of ${items.length}…`;
  else if (phase === "done") status = `${finished.length} ready${failed ? ` · ${failed} failed` : ""}${finished.length ? ` · ${formatKB(inKB)} → ${formatKB(outKB)}` : ""}`;
  else if (items.length) status = loading ? `Loading previews: ${items.length - loading} of ${items.length}` : `${plural(items.length)} ${words.ready}`;

  const reason = !valid ? (invalidReason ?? "Fix the highlighted setting first.") : loading ? "Waiting for previews to load." : "";
  const primary = phase === "running"
    ? <Button variant="secondary" onClick={() => { cancelRef.current = true; }}>Stop</Button>
    : phase === "done" && finished.length
      ? <Button onClick={downloadZip} disabled={zipping}>{zipping ? "Building ZIP…" : "Download ZIP"}</Button>
      : <Button onClick={run} disabled={!items.length || !valid || loading > 0}>{`${words.verb} ${plural(items.length)}`}</Button>;

  if (!items.length) {
    return (
      <div className={s.empty}>
        <DropZone onFiles={addFiles} title="Drop images here" />
        {notice && <p className={s.help} role="status">{notice}</p>}
        <div className={s.emptyNote}><span>Images stay on your device</span><span>JPG, PNG, WebP · up to {LIMITS.maxFiles} files, 30 MB each</span></div>
      </div>
    );
  }

  return (
    <div className={s.withBar}>
      <div className={s.workspace}>
        {settings(phase === "running")}

        <section aria-labelledby="batch-res" className={s.wide}>
          <div className={s.resultsHead}><h2 id="batch-res">{phase === "idle" ? "Your images" : "Results"}</h2></div>
          <div className={s.batch}>
            <div className={s.batchStatus}>
              <span role="status" aria-live="polite">{status}</span>
              {phase === "running" && <Progress value={done / items.length} label={`${words.progressing} progress`} />}
              {reason && phase === "idle" && <span className="muted">{reason}</span>}
            </div>
            <div className={s.batchActions}>
              <span className={s.desktopOnly}>{primary}</span>
              {phase === "done" && <TextButton onClick={run}>{words.verb} again</TextButton>}
              {phase !== "running" && <TextButton onClick={startOver}>Start over</TextButton>}
            </div>
          </div>
          {notice && <p className={s.help} role="status">{notice}</p>}
          <ul className={s.grid} aria-label="Images">
            {items.map(it => {
              const r = it.result;
              const tone = !r ? "neutral" : r.status === "fail" ? "fail" : r.status === "note" ? "check" : "pass";
              const label = !r ? (it.state === "working" ? "Working" : it.state === "loading" ? "Loading" : "Waiting") : r.status === "fail" ? "Failed" : r.status === "note" ? "Done · note" : "Done";
              return (
                <li key={it.id} className={s.tile}>
                  <div className={s.frame}>
                    {it.outUrl ? <img src={it.outUrl} alt="" /> : it.thumb ? <img src={it.thumb} alt="" /> : <span className={s.placeholder}>{it.state === "loading" ? "Loading preview" : "Preview unavailable"}</span>}
                    {it.state === "working" && <span className={s.scan} />}
                  </div>
                  <div className={s.meta}>
                    <span className={s.name} title={it.file.name}>{it.output ?? it.file.name}</span>
                    <span><Tag tone={tone}>{label}</Tag></span>
                    <span className="muted">
                      {r?.blob ? `${r.outW}×${r.outH} · ${formatKB(Math.round(it.file.size / 1024))} → ${formatKB(Math.round(r.blob.size / 1024))}` : formatKB(Math.round(it.file.size / 1024))}
                    </span>
                    {r && r.issues.length > 0 && <span className={s.note}>{r.issues.join(" ")}</span>}
                    {r?.blob && <TextButton className={s.start} onClick={() => saveBlob(it.output!, r.blob!)} aria-label={`Download ${it.output}`}>Download</TextButton>}
                  </div>
                  {phase !== "running" && <button className={s.remove} data-remove aria-label={`Remove ${it.file.name}`} onClick={() => { remove(it.id); focusAfterRemove(items.indexOf(it)); }}>×</button>}
                </li>
              );
            })}
          </ul>
          {phase !== "running" && items.length < LIMITS.maxFiles && <div className={s.addMore}><DropZone onFiles={addFiles} compact title="Add more images" /></div>}
        </section>
      </div>
      <div className={s.actionBar}><span>{status}{reason && phase === "idle" ? ` · ${reason}` : ""}</span>{primary}</div>
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

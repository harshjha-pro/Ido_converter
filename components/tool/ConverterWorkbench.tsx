"use client";
/* eslint-disable @next/next/no-img-element -- previews are local blob: URLs of the user's own files */
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { Checkbox, NumberField, TextField } from "@/components/ui/Field";
import { Progress, Toast, type ToastData } from "@/components/ui/Feedback";
import { Tag } from "@/components/ui/Tag";
import { LIMITS } from "@/lib/config";
import { EXT, type ConvertResult, type ConvertSettings, type OutFormat, type ResizeMode, type Rotation } from "@/lib/image/convert";
import { runConvert, runThumb } from "@/lib/image/client";
import { buildZip } from "@/lib/image/zip";
import { formatKB, saveBlob } from "@/lib/image/files";
import { useLeaveWarning } from "./useLeaveWarning";
import { DropZone } from "./DropZone";
import s from "./workbench.module.css";

interface Item { id: number; file: File; thumb?: string; state: "loading" | "ready" | "working" | "done"; result?: ConvertResult; outUrl?: string; output?: string }
interface Form { format: OutFormat; quality: string; resize: ResizeMode; px: string; noEnlarge: boolean; rotate: Rotation; flipH: boolean; flipV: boolean; pattern: string }

const FORMATS: [OutFormat, string, string][] = [
  ["image/jpeg", "JPG", "Photos, smallest files"], ["image/png", "PNG", "Graphics, keeps transparency"],
  ["image/webp", "WebP", "Websites, small with transparency"], ["keep", "Keep format", "Same type as each original"],
];
const RESIZES: [ResizeMode, string][] = [["none", "Keep size"], ["longest", "Longest side"], ["width", "Width"], ["height", "Height"]];
const inRange = (v: string, lo: number, hi: number) => { const n = Number(v); return v !== "" && Number.isFinite(n) && n >= lo && n <= hi; };

function outName(pattern: string, original: string, i: number, ext: string, used: Set<string>) {
  let n = (pattern || "{name}").replaceAll("{name}", original.replace(/\.[^.]+$/, "")).replaceAll("{n}", String(i + 1).padStart(3, "0"));
  n = n.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim() || `image-${i + 1}`;
  let out = `${n}.${ext}`, k = 2;
  while (used.has(out.toLowerCase())) out = `${n}-${k++}.${ext}`;
  used.add(out.toLowerCase());
  return out;
}

export function ConverterWorkbench() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Form>({ format: "image/webp", quality: "82", resize: "none", px: "1600", noEnlarge: true, rotate: 0, flipH: false, flipV: false, pattern: "{name}" });
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

  const update = (p: Partial<Form>) => { setForm(f => ({ ...f, ...p })); if (phase === "done") setPhase("idle"); };
  const pngOnly = form.format === "image/png";
  const valid = inRange(form.quality, 10, 100) && (form.resize === "none" || inRange(form.px, 16, 10000));

  const addFiles = (incoming: File[]) => {
    if (phase === "running") return;
    const ok = incoming.filter(f => LIMITS.accept.includes(f.type));
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
    const settings: ConvertSettings = {
      format: form.format, quality: Number(form.quality) / 100, resize: form.resize, px: Number(form.px),
      noEnlarge: form.noEnlarge, rotate: form.rotate, flipH: form.flipH, flipV: form.flipV,
    };
    const list = itemsRef.current;
    for (const it of list) if (it.outUrl) URL.revokeObjectURL(it.outUrl);
    setItems(prev => prev.map(x => ({ ...x, state: "ready", result: undefined, outUrl: undefined, output: undefined })));
    setPhase("running"); setDone(0); cancelRef.current = false;
    const used = new Set<string>();
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      if (cancelRef.current) break;
      const it = list[i];
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, state: "working" } : x));
      let result: ConvertResult;
      try { result = await runConvert(it.file, settings); }
      catch { result = { status: "fail", issues: ["Something went wrong with this image. Try it on its own."], inW: 0, inH: 0 }; }
      const output = result.blob ? outName(form.pattern, it.file.name, i, EXT[result.outType ?? ""] ?? "img", used) : undefined;
      const outUrl = result.blob ? URL.createObjectURL(result.blob) : undefined;
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, state: "done", result, output, outUrl } : x));
      setDone(++n);
    }
    setPhase("done");
    if (cancelRef.current) setNotice(`Stopped after ${n} of ${list.length}.`);
  };

  const finished = items.filter(i => i.result?.blob);
  const failed = items.filter(i => i.result?.status === "fail").length;
  const inKB = finished.reduce((a, i) => a + Math.round(i.file.size / 1024), 0);
  const outKB = finished.reduce((a, i) => a + Math.round((i.result?.blob?.size ?? 0) / 1024), 0);
  const loading = items.filter(i => i.state === "loading").length;

  const downloadZip = async () => {
    setZipping(true);
    try {
      const zip = await buildZip(finished.map(i => ({ name: `idoconverter-converted/${i.output}`, blob: i.result!.blob! })));
      saveBlob("idoconverter-converted.zip", zip);
      setToast({ id: Date.now(), text: `ZIP downloaded · ${finished.length} image${finished.length === 1 ? "" : "s"} · ${formatKB(Math.round(zip.size / 1024))}` });
    } catch { setToast({ id: Date.now(), text: "Couldn’t build the ZIP. Download images one by one or try a smaller batch." }); }
    finally { setZipping(false); }
  };

  let status = "";
  if (phase === "running") status = `Converting ${Math.min(done + 1, items.length)} of ${items.length}…`;
  else if (phase === "done") status = `${finished.length} ready${failed ? ` · ${failed} failed` : ""}${finished.length ? ` · ${formatKB(inKB)} → ${formatKB(outKB)}` : ""}`;
  else if (items.length) status = loading ? `Loading previews: ${items.length - loading} of ${items.length}` : `${items.length} image${items.length === 1 ? "" : "s"} ready to convert`;

  const reason = !valid ? "Fix the highlighted setting first." : loading ? "Waiting for previews to load." : "";
  const primary = phase === "running"
    ? <Button variant="secondary" onClick={() => { cancelRef.current = true; }}>Stop</Button>
    : phase === "done" && finished.length
      ? <Button onClick={downloadZip} disabled={zipping}>{zipping ? "Building ZIP…" : "Download ZIP"}</Button>
      : <Button onClick={run} disabled={!items.length || !valid || loading > 0}>{`Convert ${items.length} image${items.length === 1 ? "" : "s"}`}</Button>;

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
      <div className={s.workspace} style={{ gridTemplateColumns: undefined }}>
        <aside className={`${s.panel} ${s.sticky}`} aria-labelledby="cv-set">
          <div className={s.panelSection}>
            <h2 id="cv-set">Convert to</h2>
            <div className={s.presets} role="radiogroup" aria-labelledby="cv-set">
              {FORMATS.map(([v, l, d]) => (
                <label key={v} className={s.preset}>
                  <input type="radio" name="cv-format" checked={form.format === v} disabled={phase === "running"} onChange={() => update({ format: v })} />
                  <span className={s.t}>{l}</span><span className={s.d}>{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={`${s.panelSection} ${s.fields}`}>
            <NumberField label="Quality" unit="%" min={10} max={100} value={form.quality} disabled={phase === "running" || pngOnly}
              onChange={v => update({ quality: v })} hint={pngOnly ? "PNG is lossless, so quality doesn’t apply." : "Lower means smaller files. 75–85% suits most photos."} />
            <fieldset className={s.fields} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 4 }}>Resize</legend>
              <div className={s.presets}>
                {RESIZES.map(([v, l]) => (
                  <label key={v} className={s.preset}>
                    <input type="radio" name="cv-resize" checked={form.resize === v} disabled={phase === "running"} onChange={() => update({ resize: v })} />
                    <span className={s.t}>{l}</span>
                  </label>
                ))}
              </div>
              {form.resize !== "none" && (
                <>
                  <NumberField label={form.resize === "longest" ? "Longest side" : form.resize === "width" ? "Width" : "Height"} unit="px" min={16} max={10000}
                    value={form.px} disabled={phase === "running"} onChange={v => update({ px: v })} hint="The other side follows the original proportions." />
                  <Checkbox label="Don’t enlarge smaller images" checked={form.noEnlarge} disabled={phase === "running"} onChange={v => update({ noEnlarge: v })} />
                </>
              )}
            </fieldset>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 8 }}>Rotate</legend>
              <div className={s.seg} role="group" aria-label="Rotate clockwise" style={{ marginTop: 0 }}>
                {([0, 90, 180, 270] as Rotation[]).map(r => (
                  <button key={r} type="button" aria-pressed={form.rotate === r} disabled={phase === "running"} onClick={() => update({ rotate: r })}>{r}°</button>
                ))}
              </div>
            </fieldset>
            <Checkbox label="Flip horizontally (mirror)" checked={form.flipH} disabled={phase === "running"} onChange={v => update({ flipH: v })} />
            <Checkbox label="Flip vertically" checked={form.flipV} disabled={phase === "running"} onChange={v => update({ flipV: v })} />
            <TextField label="File names" value={form.pattern} disabled={phase === "running"} onChange={v => update({ pattern: v })} hint="{name} = original name, {n} = 001, 002…" />
          </div>
        </aside>

        <section aria-labelledby="cv-res" style={{ gridColumn: "span 2" }}>
          <div className={s.resultsHead}><h2 id="cv-res">{phase === "idle" ? "Your images" : "Results"}</h2></div>
          <div className={s.batch}>
            <div className={s.batchStatus}>
              <span role="status" aria-live="polite">{status}</span>
              {phase === "running" && <Progress value={done / items.length} label="Conversion progress" />}
              {reason && phase === "idle" && <span className="muted">{reason}</span>}
            </div>
            <div className={s.batchActions}>
              <span className={s.desktopOnly}>{primary}</span>
              {phase === "done" && <TextButton onClick={run}>Convert again</TextButton>}
              {phase !== "running" && <TextButton onClick={() => { for (const it of items) { if (it.thumb) URL.revokeObjectURL(it.thumb); if (it.outUrl) URL.revokeObjectURL(it.outUrl); } setItems([]); setPhase("idle"); setNotice(""); }}>Start over</TextButton>}
            </div>
          </div>
          {notice && <p className={s.help} role="status">{notice}</p>}
          <ul className={s.grid} aria-label="Images" style={{ listStyle: "none", padding: 0 }}>
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
                    {r && r.issues.length > 0 && <span className="muted" style={{ fontSize: 13 }}>{r.issues.join(" ")}</span>}
                    {r?.blob && <TextButton style={{ justifySelf: "start" }} onClick={() => saveBlob(it.output!, r.blob!)} aria-label={`Download ${it.output}`}>Download</TextButton>}
                  </div>
                  {phase === "idle" && !r && <button className={s.remove} aria-label={`Remove ${it.file.name}`} onClick={() => remove(it.id)}>×</button>}
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

"use client";
/* eslint-disable @next/next/no-img-element -- previews are local blob: URLs of the user's own files; next/image can't optimise them */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, TextButton } from "@/components/ui/Button";
import { Progress, Toast, type ToastData } from "@/components/ui/Feedback";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { LIMITS, whatsappLink } from "@/lib/config";
import { PRESETS, isPresetKey, type PresetKey } from "@/lib/presets";
import type { ProcessResult, ProcessSettings, Status } from "@/lib/image/engine";
import { runProcess, runThumb, usingWorker } from "@/lib/image/client";
import type { BatchEventInput } from "@/lib/validation";
import { buildZip } from "@/lib/image/zip";
import { acceptImages, csvReport, formatKB, outputName, saveBlob, takeHandoff } from "@/lib/image/files";
import { extraKeys, presetDefaults, zipName } from "@/lib/image/productPlan";
import { DropZone } from "./DropZone";
import { useLeaveWarning } from "./useLeaveWarning";
import { focusAfterRemove, trapTab } from "./focus";
import { Overlay } from "./Overlay";
import { ProductSettings } from "./product/ProductSettings";
import { Inspector } from "./product/Inspector";
import { LABEL, fromPreset, type Item, type Phase, type Settings } from "./product/types";
import s from "./workbench.module.css";

type Filter = "all" | Status;

const SAMPLES = ["teal-mug.jpg", "amber-bottle.jpg", "gold-earrings.jpg", "canvas-tote.jpg"];

/** Anonymous batch summary for validation metrics: counts only. Skipped when the browser signals Global Privacy Control. */
function sendBatchEvent(e: BatchEventInput) {
  try {
    if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    void fetch("/api/events/batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e), keepalive: true }).catch(() => undefined);
  } catch { /* never affect the tool */ }
}
function deviceClass(): BatchEventInput["deviceClass"] {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1100 ? "tablet" : "desktop";
}
const inRange = (v: string, lo: number, hi: number) => { const n = Number(v); return v !== "" && Number.isFinite(n) && n >= lo && n <= hi; };

function useIsDesktop() {
  const [desk, setDesk] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px)");
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desk;
}

export function Workbench() {
  const params = useSearchParams();
  const initialPreset = isPresetKey(params.get("preset")) ? (params.get("preset") as PresetKey) : "amazon";
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<Settings>(() => fromPreset(initialPreset));
  const [phase, setPhase] = useState<Phase>("idle");
  const [processedKey, setProcessedKey] = useState("");
  const [doneCount, setDoneCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const [zipping, setZipping] = useState(false);
  const cancelRef = useRef(false);
  const idRef = useRef(0);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  const booted = useRef(false);
  const isDesktop = useIsDesktop();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTileRef = useRef<HTMLElement | null>(null);

  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const preset = PRESETS[settings.presetKey];
  useLeaveWarning(phase === "running");
  const showToast = useCallback((text: string, action?: ToastData["action"]) => setToast({ id: Date.now(), text, action }), []);
  const closeToast = useCallback(() => setToast(null), []);

  /* ---------- Adding and removing files ---------- */
  const addFiles = useCallback(async (incoming: File[]) => {
    if (phaseRef.current === "running") return;
    const { accepted: ok, skipped } = await acceptImages(incoming);
    const room = LIMITS.maxFiles - itemsRef.current.length;
    const take = ok.slice(0, Math.max(0, room));
    const dropped = ok.length - take.length;

    // Adding after a run starts a fresh run with everything in the list.
    if (phaseRef.current === "done") {
      for (const it of itemsRef.current) if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      setItems(prev => prev.map(it => ({ ...it, state: it.thumb ? "ready" : it.state, result: undefined, outUrl: undefined, output: undefined })));
      setPhase("idle"); setFilter("all"); setSelected(null);
    }

    const fresh: Item[] = take.map(f => ({ id: ++idRef.current, file: f, name: f.name, inKB: Math.round(f.size / 1024), state: "loading" }));
    if (fresh.length) setItems(prev => [...prev, ...fresh]);

    const parts: string[] = [];
    if (skipped) parts.push(`${skipped} skipped: only JPG, PNG and WebP work.`);
    if (dropped) parts.push(`${dropped} not added: the limit is ${LIMITS.maxFiles} photos per batch.`);
    setNotice(parts.join(" "));

    for (const it of fresh) {
      runThumb(it.file).then(b => {
        const url = b ? URL.createObjectURL(b) : undefined;
        if (!itemsRef.current.some(x => x.id === it.id) && url) { URL.revokeObjectURL(url); }
        setItems(prev => prev.map(x => x.id === it.id ? { ...x, thumb: url, state: x.state === "loading" ? "ready" : x.state } : x));
      });
    }
  }, []);

  const removeItem = (id: number) => {
    const it = items.find(x => x.id === id);
    if (it?.thumb) URL.revokeObjectURL(it.thumb);
    if (it?.outUrl) URL.revokeObjectURL(it.outUrl);
    setItems(prev => prev.filter(x => x.id !== id));
    if (selected === id) setSelected(null);
  };

  const startOver = () => {
    for (const it of items) { if (it.thumb) URL.revokeObjectURL(it.thumb); if (it.outUrl) URL.revokeObjectURL(it.outUrl); }
    setItems([]); setPhase("idle"); setFilter("all"); setSelected(null); setNotice(""); setCancelled(false); setProcessedKey("");
    window.scrollTo({ top: 0 });
  };

  const loadSamples = useCallback(async () => {
    try {
      const files = await Promise.all(SAMPLES.map(async n => {
        const r = await fetch(`/samples/${n}`);
        if (!r.ok) throw new Error(n);
        return new File([await r.blob()], n, { type: "image/jpeg" });
      }));
      addFiles(files);
    } catch {
      setNotice("Couldn’t load the sample photos. Check your connection and try again.");
    }
  }, [addFiles]);

  // Files handed over from the homepage, or ?samples=1
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const handed = takeHandoff();
    if (handed.length) addFiles(handed);
    else if (params.get("samples") === "1") loadSamples();
  }, [addFiles, loadSamples, params]);

  // Free object URLs when leaving the page
  useEffect(() => () => {
    for (const it of itemsRef.current) { if (it.thumb) URL.revokeObjectURL(it.thumb); if (it.outUrl) URL.revokeObjectURL(it.outUrl); }
  }, []);

  /* ---------- Settings ---------- */
  const valid = inRange(settings.size, 500, 5000) && inRange(settings.fill, 50, 98) && inRange(settings.maxKB, 100, 20000);
  const settingsKey = JSON.stringify(settings);
  const dirty = phase === "done" && settingsKey !== processedKey;
  const update = (patch: Partial<Settings>) => setSettings(prev => ({ ...prev, ...patch }));

  /* ---------- Processing ---------- */
  const run = async () => {
    if (!valid || !items.length) return;
    const list = itemsRef.current;
    const ps: ProcessSettings = {
      presetKey: settings.presetKey, size: Math.round(Number(settings.size)), fill: Number(settings.fill) / 100,
      maxBytes: Number(settings.maxKB) * 1024, clean: settings.clean, tolerance: preset.tolerance, minSide: preset.minSide,
    };
    for (const it of list) if (it.outUrl) URL.revokeObjectURL(it.outUrl);
    setItems(prev => prev.map(it => ({ ...it, state: "ready", result: undefined, outUrl: undefined, output: undefined, extras: undefined })));
    const extras = extraKeys(settings.presetKey, settings.extras);
    const usedByExtra = Object.fromEntries(extras.map(k => [k, new Set<string>()]));
    setPhase("running"); setFilter("all"); setSelected(null); setDoneCount(0); setCancelled(false); setNotice("");
    cancelRef.current = false;
    const used = new Set<string>();
    const t0 = performance.now();
    let n = 0;
    const tally = { pass: 0, check: 0, fail: 0 };
    for (let i = 0; i < list.length; i++) {
      if (cancelRef.current) break;
      const it = list[i];
      if (!itemsRef.current.some(x => x.id === it.id)) continue;
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, state: "processing" } : x));
      let result: ProcessResult;
      try { result = await runProcess(it.file, ps); }
      catch { result = { status: "fail", issues: ["Something went wrong with this photo. Try it again on its own."], inW: 0, inH: 0, background: "" }; }
      const output = result.blob ? outputName(settings.pattern || "{name}", it.name, i, used) : undefined;
      const outUrl = result.blob ? URL.createObjectURL(result.blob) : undefined;
      // Extra marketplaces run at their preset defaults, after the main result, so the main preview appears first.
      const extraResults: Item["extras"] = {};
      for (const k of extras) {
        if (cancelRef.current) break;
        let r: ProcessResult;
        try { r = await runProcess(it.file, presetDefaults(k)); }
        catch { r = { status: "fail", issues: ["Something went wrong with this photo. Try it again on its own."], inW: 0, inH: 0, background: "" }; }
        extraResults[k] = { result: r, output: r.blob ? outputName(PRESETS[k].pattern, it.name, i, usedByExtra[k]) : undefined };
      }
      setItems(prev => prev.map(x => x.id === it.id ? { ...x, state: "done", result, output, outUrl, extras: extraResults } : x));
      tally[result.status]++;
      setDoneCount(++n);
    }
    if (n > 0) {
      sendBatchEvent({
        presetKey: settings.presetKey, photoCount: list.length, processedCount: n,
        passCount: tally.pass, checkCount: tally.check, failCount: tally.fail,
        durationMs: Math.round(performance.now() - t0), outputSize: ps.size, deviceClass: deviceClass(),
        usedWorker: usingWorker(), cancelled: cancelRef.current, usedSamples: list.every(x => SAMPLES.includes(x.name)),
      });
    }
    setElapsed((performance.now() - t0) / 1000);
    setCancelled(cancelRef.current);
    setProcessedKey(settingsKey);
    setPhase("done");
  };

  // After a run on desktop, open the first photo that needs attention
  useEffect(() => {
    if (phase !== "done" || !isDesktop) return;
    const first = itemsRef.current.find(x => x.result && x.result.status !== "pass") ?? itemsRef.current.find(x => x.result);
    if (first) setSelected(first.id);
  }, [phase, isDesktop]);

  /* ---------- Exports ---------- */
  const finished = items.filter(i => i.result?.blob);
  // Extra marketplaces present in the latest results (the settings may have changed since).
  const doneExtras = (Object.keys(PRESETS) as PresetKey[]).filter(k => items.some(i => i.extras?.[k]));
  const downloadZip = async () => {
    if (!finished.length || zipping) return;
    setZipping(true);
    try {
      const folder = `idoconverter-${preset.folder}/`;
      const entries = finished.map(i => ({ name: folder + i.output, blob: i.result!.blob! }));
      entries.push({ name: folder + "report.csv", blob: new Blob([csvReport(items.map(i => ({ original: i.name, output: i.output, inKB: i.inKB, result: i.result })), preset.label)], { type: "text/csv" }) });
      for (const k of doneExtras) {
        const p = PRESETS[k], f = `idoconverter-${p.folder}/`;
        for (const i of items) { const e = i.extras?.[k]; if (e?.result.blob && e.output) entries.push({ name: f + e.output, blob: e.result.blob }); }
        entries.push({ name: f + "report.csv", blob: new Blob([csvReport(items.map(i => ({ original: i.name, output: i.extras?.[k]?.output, inKB: i.inKB, result: i.extras?.[k]?.result })), p.label)], { type: "text/csv" }) });
      }
      const zip = await buildZip(entries);
      saveBlob(zipName(preset.folder, doneExtras.length), zip);
      const photos = entries.filter(e => !e.name.endsWith("report.csv")).length;
      showToast(`ZIP downloaded · ${photos} photo${photos === 1 ? "" : "s"}${doneExtras.length ? ` in ${doneExtras.length + 1} folders` : ""} · ${formatKB(Math.round(zip.size / 1024))}`);
    } catch {
      showToast("Couldn’t build the ZIP. Try a smaller batch.");
    } finally {
      setZipping(false);
    }
  };
  const downloadCsv = () => {
    saveBlob("idoconverter-report.csv", new Blob([csvReport(items.map(i => ({ original: i.name, output: i.output, inKB: i.inKB, result: i.result })), preset.label)], { type: "text/csv" }));
    showToast("Report downloaded");
  };

  /* ---------- Derived ---------- */
  const counts = useMemo(() => {
    const c = { pass: 0, check: 0, fail: 0 };
    for (const i of items) if (i.result) c[i.result.status]++;
    return c;
  }, [items]);
  const loading = items.filter(i => i.state === "loading").length;
  const notWhite = items.filter(i => i.result?.background === "Not white").length;
  const inTotal = finished.reduce((a, i) => a + i.inKB, 0);
  const outTotal = finished.reduce((a, i) => a + (i.result?.outKB ?? 0), 0);
  const visible = filter === "all" ? items : items.filter(i => i.result?.status === filter);
  const current = items.find(i => i.id === selected) ?? null;
  const helpLink = notWhite ? whatsappLink(`Hi Idoconverter, I have ${notWhite} product photo${notWhite === 1 ? "" : "s"} with a busy background for ${preset.label}. Can you fix ${notWhite === 1 ? "it" : "them"}?`) : null;

  let status = "";
  if (phase === "running") status = `Processing ${Math.min(doneCount + 1, items.length)} of ${items.length}…`;
  else if (phase === "done") status = `${cancelled ? `Stopped after ${doneCount} of ${items.length}` : `Done in ${elapsed.toFixed(1)} s`} · ${finished.length} ready${counts.fail ? ` · ${counts.fail} failed` : ""}`;
  else if (items.length) status = loading ? `Loading previews: ${items.length - loading} of ${items.length}` : `${items.length} photo${items.length === 1 ? "" : "s"} ready to process`;

  /* ---------- Primary action (exactly one) ---------- */
  let primary: React.ReactNode = null;
  if (phase === "running") primary = <Button variant="secondary" onClick={() => { cancelRef.current = true; }}>Stop</Button>;
  else if (phase === "done" && !dirty) primary = <Button onClick={downloadZip} disabled={!finished.length || zipping}>{zipping ? "Building ZIP…" : "Download ZIP"}</Button>;
  else primary = <Button onClick={run} disabled={!items.length || !valid || loading > 0}>{phase === "done" ? "Process again" : `Process ${items.length} photo${items.length === 1 ? "" : "s"}`}</Button>;
  const primaryReason = !valid ? "Fix the highlighted setting first." : loading ? "Waiting for previews to load." : "";

  /* ---------- Inspector open/close ---------- */
  const openItem = (id: number, el: HTMLElement) => { lastTileRef.current = el; setSelected(id); };
  const closeInspector = useCallback(() => { setSelected(null); lastTileRef.current?.focus(); }, []);
  const sheetOpen = !isDesktop && current !== null;
  useEffect(() => {
    if (!sheetOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInspector();
      else trapTab(e, closeRef.current?.closest('[role="dialog"]'));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen, closeInspector]);

  /* ---------- Render ---------- */
  if (!items.length) {
    return (
      <div className={s.empty}>
        <DropZone onFiles={addFiles} />
        {notice && <p className={s.help} role="status">{notice}</p>}
        <div className={s.emptyNote}>
          <span>Photos stay on your device</span>
          <span>Up to {LIMITS.maxFiles} photos, {LIMITS.maxMegapixels} MP each</span>
          <TextButton onClick={loadSamples}>No photos handy? Try 4 sample photos</TextButton>
        </div>
      </div>
    );
  }

  return (
    <div className={s.withBar}>
      <div className={s.workspace}>
        <ProductSettings settings={settings} disabled={phase === "running"} onPreset={k => setSettings(prev => fromPreset(k, prev.extras))} update={update} />

        {/* Results */}
        <section aria-labelledby="res-h">
          <div className={s.resultsHead}>
            <h2 id="res-h">{phase === "idle" ? "Your photos" : "Results"}</h2>
            {phase !== "idle" && counts.pass + counts.check + counts.fail > 0 && (
              <div className={s.chips} role="group" aria-label="Filter results">
                {(["all", "pass", "check", "fail"] as Filter[]).map(f => (
                  <button key={f} className={s.chip} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f === "all" ? "All" : LABEL[f]} {f === "all" ? items.length : counts[f]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={s.batch}>
            <div className={s.batchStatus}>
              <span role="status" aria-live="polite">{status}</span>
              {phase === "running" && <Progress value={doneCount / items.length} label="Processing progress" />}
              {(primaryReason && phase !== "running" && !(phase === "done" && !dirty)) && <span className="muted">{primaryReason}</span>}
            </div>
            <div className={s.batchActions}>
              <span className={s.desktopOnly}>{primary}</span>
              {phase === "done" && dirty && finished.length > 0 && <TextButton onClick={downloadZip}>Download previous ZIP</TextButton>}
              {phase === "done" && <TextButton onClick={downloadCsv}>Report (CSV)</TextButton>}
              {phase !== "running" && <TextButton onClick={startOver}>Start over</TextButton>}
            </div>
          </div>

          {phase === "done" && (
            <div className={s.summary}>
              <div><b>{counts.pass}</b>Pass</div>
              <div><b>{counts.check}</b>Check</div>
              <div><b>{counts.fail}</b>Fail</div>
              {finished.length > 0 && <div><b>{formatKB(inTotal)} → {formatKB(outTotal)}</b>Total size</div>}
            </div>
          )}
          {phase === "done" && doneExtras.length > 0 && (
            <ul className={s.extraSummary} aria-label="Other marketplaces in this ZIP">
              {doneExtras.map(k => {
                const c = { pass: 0, check: 0, fail: 0 };
                for (const i of items) { const r = i.extras?.[k]?.result; if (r) c[r.status]++; }
                return <li key={k}><b>{PRESETS[k].label}</b> {c.pass} Pass · {c.check} Check · {c.fail} Fail</li>;
              })}
            </ul>
          )}
          {dirty && <p className={s.help}>Settings changed. Process again to apply them.</p>}
          {phase === "done" && notWhite > 0 && (
            <p className={s.help}>
              {notWhite} photo{notWhite === 1 ? " needs" : "s need"} background removal, so {notWhite === 1 ? "it’s" : "they’re"} not in the ZIP.{" "}
              {helpLink
                ? <a href={helpLink} target="_blank" rel="noopener noreferrer">Send {notWhite === 1 ? "it" : "them"} to us on WhatsApp and we’ll fix {notWhite === 1 ? "it" : "them"}.</a>
                : <Link href="/photo-guide">Reshoot on white with the photo guide.</Link>}
            </p>
          )}
          {notice && <p className={s.help} role="status">{notice}</p>}
          {phase === "done" && finished.length > 0 && (
            <p className={s.upsell}>
              Doing this every week? <Link href="/#early-access">Get founding-user access</Link> to saved workflows and background removal.
            </p>
          )}

          <ul className={s.grid} aria-label="Photos">
            {visible.map(it => {
              const r = it.result;
              const tone: TagTone = r ? r.status : "neutral";
              const label = r ? LABEL[r.status] : it.state === "processing" ? "Working" : it.state === "loading" ? "Loading" : "Waiting";
              return (
                <li key={it.id} className={s.tile}>
                  <button className={s.tileBtn} disabled={!r} aria-current={selected === it.id ? "true" : undefined}
                    aria-label={`${it.name}: ${label}${r ? ". Open details" : ""}`}
                    onClick={e => openItem(it.id, e.currentTarget)}>
                    <div className={s.frame}>
                      {r?.blob && it.outUrl ? (
                        <>
                          <img src={it.outUrl} alt="" loading="lazy" decoding="async" />
                          <Overlay size={r.size!} box={r.box!} target={r.target!} />
                        </>
                      ) : it.thumb ? (
                        <img src={it.thumb} alt="" decoding="async" />
                      ) : (
                        <span className={s.placeholder}>{it.state === "loading" ? "Loading preview" : r ? "No output" : "Preview unavailable"}</span>
                      )}
                      {r && !r.blob && it.thumb && <span className={`${s.placeholder} ${s.veil}`}>Not in ZIP</span>}
                      {it.state === "processing" && <span className={s.scan} />}
                    </div>
                    <span className={s.meta}>
                      <span className={s.name} title={it.name}>{it.name}</span>
                      <span><Tag tone={tone}>{label}</Tag></span>
                      <span className="muted">
                        {r?.blob ? `${r.size} px · ${formatKB(r.outKB!)} · ${r.fillPct}%` : formatKB(it.inKB)}
                      </span>
                    </span>
                  </button>
                  {phase !== "running" && (
                    <button className={s.remove} data-remove aria-label={`Remove ${it.name}`} onClick={() => { removeItem(it.id); focusAfterRemove(visible.indexOf(it)); }}>×</button>
                  )}
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && <p className={s.emptyFilter}>No photos with this result.</p>}

          {phase !== "running" && items.length < LIMITS.maxFiles && (
            <div className={s.addMore}><DropZone onFiles={addFiles} compact title="Add more photos" /></div>
          )}
        </section>

        {/* Inspector */}
        {sheetOpen && <button className={s.backdrop} aria-label="Close details" onClick={closeInspector} />}
        <Inspector item={current} preset={preset} phase={phase} sheetOpen={sheetOpen} closeRef={closeRef} onClose={closeInspector}
          onDownload={it => saveBlob(it.output!, it.result!.blob!)} />
      </div>

      <div className={s.actionBar}>
        <span>{status}{primaryReason && phase !== "running" && !(phase === "done" && !dirty) ? ` · ${primaryReason}` : ""}</span>
        {primary}
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

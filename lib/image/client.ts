/**
 * Runs the engine in a Web Worker when the browser supports OffscreenCanvas,
 * otherwise on the main thread. Jobs run one at a time to keep memory predictable.
 */
import { makeThumb, processImage, type ProcessResult, type ProcessSettings } from "./engine";
import { convertImage, type ConvertResult, type ConvertSettings } from "./convert";
import { watermarkImage, type WatermarkSettings } from "./watermark";

type Pending = { resolve: (v: unknown) => void; reject: (e: unknown) => void };

let worker: Worker | null = null;
let workerFailed = false;
let seq = 0;
const pending = new Map<number, Pending>();

function canUseWorker() {
  return typeof window !== "undefined" && typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined"
    && "convertToBlob" in OffscreenCanvas.prototype && !workerFailed;
}

function getWorker(): Worker | null {
  if (!canUseWorker()) return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<{ id: number; ok: boolean; result?: unknown; error?: string }>) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      if (e.data.ok) p.resolve(e.data.result); else p.reject(new Error(e.data.error));
    };
    worker.onerror = () => {
      workerFailed = true;
      for (const p of pending.values()) p.reject(new Error("worker"));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
    return worker;
  } catch {
    workerFailed = true;
    return null;
  }
}

function call<T>(msg: Record<string, unknown>): Promise<T> | null {
  const w = getWorker();
  if (!w) return null;
  const id = ++seq;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
    w.postMessage({ ...msg, id });
  });
}

/** Serialise jobs so only one image is in memory at a time. */
let chain: Promise<unknown> = Promise.resolve();
function queue<T>(job: () => Promise<T>): Promise<T> {
  const next = chain.then(job, job);
  chain = next.catch(() => undefined);
  return next;
}

export function runProcess(file: Blob, settings: ProcessSettings): Promise<ProcessResult> {
  return queue(async () => {
    const viaWorker = call<ProcessResult>({ kind: "process", file, settings });
    if (viaWorker) {
      try { return await viaWorker; } catch { /* fall back below */ }
    }
    return processImage(file, settings);
  });
}

export function runThumb(file: Blob): Promise<Blob | null> {
  return queue(async () => {
    const viaWorker = call<Blob | null>({ kind: "thumb", file });
    if (viaWorker) {
      try { return await viaWorker; } catch { /* fall back */ }
    }
    return makeThumb(file);
  });
}

export function runConvert(file: Blob, settings: ConvertSettings): Promise<ConvertResult> {
  return queue(async () => {
    const viaWorker = call<ConvertResult>({ kind: "convert", file, settings });
    if (viaWorker) {
      try { return await viaWorker; } catch { /* fall back */ }
    }
    return convertImage(file, settings);
  });
}

export function runWatermark(file: Blob, settings: WatermarkSettings): Promise<ConvertResult> {
  return queue(async () => {
    const viaWorker = call<ConvertResult>({ kind: "watermark", file, settings });
    if (viaWorker) {
      try { return await viaWorker; } catch { /* fall back */ }
    }
    return watermarkImage(file, settings);
  });
}

export function usingWorker() { return canUseWorker(); }

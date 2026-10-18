/** File helpers: naming, CSV, saving, and a hand-off store between pages. */
import type { ProcessResult } from "./engine";

/** Builds a safe, unique output file name from a `{name}`/`{n}` pattern. */
export function outputName(pattern: string, original: string, index: number, used: Set<string>, ext = "jpg"): string {
  let n = (pattern || "{name}")
    .replaceAll("{name}", original.replace(/\.[^.]+$/, ""))
    .replaceAll("{n}", String(index + 1).padStart(3, "0"));
  n = n.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim() || `image-${index + 1}`;
  let out = `${n}.${ext}`, k = 2;
  while (used.has(out.toLowerCase())) out = `${n}-${k++}.${ext}`;
  used.add(out.toLowerCase());
  return out;
}

/** Image type from the file's first bytes, or null. The browser's reported type comes from the extension and can be wrong or empty. */
export function sniffImageType(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "image/png";
  if (b.length >= 12 && String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/**
 * Keeps files whose content is JPG, PNG or WebP, whatever their name says, and
 * relabels them with the real type (so "keep format" and decoding use the truth).
 */
export async function acceptImages(files: File[]): Promise<{ accepted: File[]; skipped: number }> {
  const accepted: File[] = [];
  for (const f of files) {
    let type: string | null = null;
    try { type = sniffImageType(new Uint8Array(await f.slice(0, 12).arrayBuffer())); } catch { type = null; }
    if (type) accepted.push(type === f.type ? f : new File([f], f.name, { type, lastModified: f.lastModified }));
  }
  return { accepted, skipped: files.length - accepted.length };
}

export interface ReportRow { original: string; output?: string; inKB: number; result?: ProcessResult }

const STATUS_LABEL = { pass: "Pass", check: "Check", fail: "Fail" } as const;

export function csvReport(rows: ReportRow[], marketplace: string): string {
  const esc = (v: unknown) => {
    let t = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; // stop spreadsheet formula injection from file names
    return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const head = ["original_file", "output_file", "marketplace", "status", "issues", "input_width", "input_height", "input_kb", "output_px", "output_kb", "product_fill_pct", "background"];
  const lines = [head.join(",")];
  for (const r of rows) {
    const x = r.result;
    lines.push([
      r.original, r.output ?? "", marketplace, x ? STATUS_LABEL[x.status] : "Not processed", x?.issues.join(" | ") ?? "",
      x?.inW || "", x?.inH || "", r.inKB, x?.size ?? "", x?.outKB ?? "", x?.fillPct ?? "", x?.background ?? "",
    ].map(esc).join(","));
  }
  return "\uFEFF" + lines.join("\r\n");
}

export function saveBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Holds files dropped on the homepage until the tool page picks them up (client-side navigation keeps module state). */
let handoff: File[] = [];
export function setHandoff(files: File[]) { handoff = files; }
export function takeHandoff(): File[] { const f = handoff; handoff = []; return f; }

export function formatKB(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

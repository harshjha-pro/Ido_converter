/** File helpers: naming, CSV, saving, and a hand-off store between pages. */
import type { ProcessResult } from "./engine";

export function outputName(pattern: string, original: string, index: number, used: Set<string>): string {
  let n = pattern
    .replaceAll("{name}", original.replace(/\.[^.]+$/, ""))
    .replaceAll("{n}", String(index + 1).padStart(3, "0"));
  n = n.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim() || `image-${index + 1}`;
  let out = `${n}.jpg`, k = 2;
  while (used.has(out.toLowerCase())) out = `${n}-${k++}.jpg`;
  used.add(out.toLowerCase());
  return out;
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

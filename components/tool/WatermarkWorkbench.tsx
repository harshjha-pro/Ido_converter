"use client";
import { useState } from "react";
import { runWatermark } from "@/lib/image/client";
import { DEFAULT_WATERMARK, problem, toWatermarkSettings, type WatermarkForm } from "@/lib/image/watermarkForm";
import { BatchWorkbench } from "./batch/BatchWorkbench";
import { WatermarkSettings } from "./watermark/WatermarkSettings";

const WORDS = { verb: "Watermark", progressing: "Watermarking", ready: "ready to watermark", zipName: "idoconverter-watermarked" };

export function WatermarkWorkbench() {
  const [form, setForm] = useState<WatermarkForm>(DEFAULT_WATERMARK);
  const [logo, setLogo] = useState<File | null>(null);
  const update = (p: Partial<WatermarkForm>) => setForm(f => ({ ...f, ...p }));
  const issue = problem(form, !!logo);
  const settings = toWatermarkSettings(form, logo ?? undefined);
  return (
    <BatchWorkbench
      words={WORDS}
      settings={disabled => <WatermarkSettings form={form} disabled={disabled} update={update} logo={logo} onLogo={setLogo} />}
      settingsKey={`${JSON.stringify(form)}|${logo?.name ?? ""}|${logo?.size ?? 0}|${logo?.lastModified ?? 0}`}
      valid={!issue}
      invalidReason={issue}
      pattern={form.pattern}
      process={file => runWatermark(file, settings)}
    />
  );
}

"use client";
import { useState } from "react";
import { runWatermark } from "@/lib/image/client";
import { DEFAULT_WATERMARK, problem, toWatermarkSettings, type WatermarkForm } from "@/lib/image/watermarkForm";
import { BatchWorkbench } from "./batch/BatchWorkbench";
import { useBrandKit } from "@/components/brand/useBrandKit";
import { dataUrlToFile } from "@/lib/brandKit";
import { WatermarkSettings } from "./watermark/WatermarkSettings";

const WORDS = { verb: "Watermark", progressing: "Watermarking", ready: "ready to watermark", zipName: "idoconverter-watermarked" };

export function WatermarkWorkbench() {
  const [form, setForm] = useState<WatermarkForm>(DEFAULT_WATERMARK);
  const [logo, setLogo] = useState<File | null>(null);
  const update = (p: Partial<WatermarkForm>) => setForm(f => ({ ...f, ...p }));
  const kit = useBrandKit();
  const brand = { name: kit.name.trim(), colors: kit.colors, onUseLogo: kit.logo ? () => setLogo(dataUrlToFile(kit.logo!)) : null };
  const issue = problem(form, !!logo);
  const settings = toWatermarkSettings(form, logo ?? undefined);
  return (
    <BatchWorkbench
      words={WORDS}
      settings={disabled => <WatermarkSettings form={form} disabled={disabled} update={update} logo={logo} onLogo={setLogo} brand={brand} />}
      settingsKey={`${JSON.stringify(form)}|${logo?.name ?? ""}|${logo?.size ?? 0}|${logo?.lastModified ?? 0}`}
      valid={!issue}
      invalidReason={issue}
      pattern={form.pattern}
      process={file => runWatermark(file, settings)}
    />
  );
}

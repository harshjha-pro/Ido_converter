"use client";
import { useState } from "react";
import { DEFAULT_FORM, isValid, toSettings, type ConverterForm } from "@/lib/image/converterForm";
import { runConvert } from "@/lib/image/client";
import { BatchWorkbench } from "./batch/BatchWorkbench";
import { ConverterSettings } from "./converter/ConverterSettings";

const WORDS = { verb: "Convert", progressing: "Converting", ready: "ready to convert", zipName: "idoconverter-converted" };

export function ConverterWorkbench() {
  const [form, setForm] = useState<ConverterForm>(DEFAULT_FORM);
  const update = (p: Partial<ConverterForm>) => setForm(f => ({ ...f, ...p }));
  const settings = toSettings(form);
  return (
    <BatchWorkbench
      words={WORDS}
      settings={disabled => <ConverterSettings form={form} disabled={disabled} update={update} />}
      settingsKey={JSON.stringify(form)}
      valid={isValid(form)}
      pattern={form.pattern}
      process={file => runConvert(file, settings)}
    />
  );
}

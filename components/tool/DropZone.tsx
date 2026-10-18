"use client";
import { useId, useState } from "react";
import { LIMITS } from "@/lib/config";
import s from "./workbench.module.css";

interface Props {
  onFiles: (files: File[]) => void;
  compact?: boolean;
  title?: string;
  disabled?: boolean;
}

export function DropZone({ onFiles, compact, title = "Drop product photos here", disabled }: Props) {
  const [over, setOver] = useState(false);
  const id = useId();
  const take = (list: FileList | null) => { if (list && list.length && !disabled) onFiles(Array.from(list)); };
  return (
    <label
      data-dropzone
      htmlFor={id}
      className={`${s.drop} ${compact ? s.dropCompact : ""} ${over ? s.over : ""}`}
      onDragEnter={e => { e.preventDefault(); setOver(true); }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={e => { e.preventDefault(); setOver(false); }}
      onDrop={e => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
    >
      <span className={`${s.corner} ${s.c1}`} /><span className={`${s.corner} ${s.c2}`} />
      <span className={`${s.corner} ${s.c3}`} /><span className={`${s.corner} ${s.c4}`} />
      <input id={id} type="file" multiple accept={LIMITS.accept.join(",")} disabled={disabled}
        onChange={e => { take(e.target.files); e.target.value = ""; }} />
      <strong>{title}</strong>
      <span className={s.sub}>
        {compact ? "or choose files" : `or choose files · JPG, PNG or WebP · up to ${LIMITS.maxFiles} at a time`}
      </span>
    </label>
  );
}

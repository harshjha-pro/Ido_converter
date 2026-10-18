"use client";
import { useEffect } from "react";
import s from "./ui.module.css";

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={s.progress} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export interface ToastData { id: number; text: string; action?: { label: string; run: () => void } }

export function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className={s.toast} role="status">
      <span>{toast.text}</span>
      {toast.action && <button onClick={() => { toast.action!.run(); onClose(); }}>{toast.action.label}</button>}
      <button onClick={onClose} aria-label="Dismiss">Dismiss</button>
    </div>
  );
}

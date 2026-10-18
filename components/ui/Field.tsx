"use client";
import { useId } from "react";
import s from "./ui.module.css";

interface NumberFieldProps {
  label: string; value: string; onChange: (v: string) => void;
  min: number; max: number; step?: number; unit?: string; hint?: string; disabled?: boolean;
}

export function NumberField({ label, value, onChange, min, max, step = 1, unit, hint, disabled }: NumberFieldProps) {
  const id = useId();
  const n = Number(value);
  const invalid = value !== "" && (!Number.isFinite(n) || n < min || n > max);
  const msgId = `${id}-msg`;
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>{label}</label>
      <div className={`${s.control} ${invalid ? s.invalid : ""}`}>
        <input id={id} type="number" inputMode="numeric" min={min} max={max} step={step} value={value} disabled={disabled}
          aria-invalid={invalid} aria-describedby={msgId} onChange={e => onChange(e.target.value)} />
        {unit && <span className={s.unit} aria-hidden="true">{unit}</span>}
      </div>
      <span id={msgId} className={invalid ? s.error : s.hint}>
        {invalid ? `Use ${min.toLocaleString("en-IN")}–${max.toLocaleString("en-IN")}${unit ? " " + unit : ""}.` : hint}
      </span>
    </div>
  );
}

export function TextField({ label, value, onChange, hint, disabled }: { label: string; value: string; onChange: (v: string) => void; hint?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>{label}</label>
      <div className={s.control}>
        <input id={id} type="text" spellCheck={false} autoComplete="off" value={value} disabled={disabled}
          aria-describedby={hint ? `${id}-h` : undefined} onChange={e => onChange(e.target.value)} />
      </div>
      {hint && <span id={`${id}-h`} className={s.hint}>{hint}</span>}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={s.checkbox}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function ColorField({ label, value, onChange, hint, disabled }: { label: string; value: string; onChange: (v: string) => void; hint?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>{label}</label>
      <div className={`${s.control} ${s.colorControl}`}>
        <input id={id} type="color" value={value} disabled={disabled} aria-describedby={hint ? `${id}-h` : undefined} onChange={e => onChange(e.target.value.toUpperCase())} />
        <span className={s.unit} aria-hidden="true">{value.toUpperCase()}</span>
      </div>
      {hint && <span id={`${id}-h`} className={s.hint}>{hint}</span>}
    </div>
  );
}

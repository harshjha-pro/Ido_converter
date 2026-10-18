"use client";
import { useEffect, useId, useState } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { MAX_SAVED, parseSaved, readJson, upsertSaved, writeJson, type SavedEntry } from "@/lib/storage";
import s from "./workbench.module.css";
import u from "@/components/ui/ui.module.css";

interface Props<T> {
  /** Storage namespace, e.g. "converter". */
  tool: string;
  current: T;
  validate: (v: unknown) => T | null;
  onApply: (v: T) => void;
  disabled?: boolean;
}

/** Named settings kept in this browser only. Lets a seller reuse a setup without an account. */
export function SavedSettings<T>({ tool, current, validate, onApply, disabled }: Props<T>) {
  const key = `ido.saved.${tool}.v1`;
  const id = useId();
  const [list, setList] = useState<SavedEntry<T>[]>([]);
  const [choice, setChoice] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  // Read after mount: storage doesn't exist during server rendering.
  useEffect(() => { setList(parseSaved(readJson(key), validate)); }, [key, validate]);

  const persist = (next: SavedEntry<T>[], ok: string) => {
    if (writeJson(key, next)) { setList(next); setMsg(ok); }
    else setMsg("Your browser didn’t allow saving. Settings can’t be remembered in private browsing or when site data is blocked.");
  };
  const save = () => {
    const n = name.trim();
    if (!n) { setMsg("Give these settings a name first."); return; }
    persist(upsertSaved(list, n, current), `Saved “${n.slice(0, 40)}” on this device.`);
    setChoice(n.slice(0, 40)); setName("");
  };
  const apply = (n: string) => {
    setChoice(n);
    const e = list.find(x => x.name === n);
    if (e) { onApply(e.value); setMsg(`Applied “${e.name}”.`); }
  };
  const remove = () => {
    const e = list.find(x => x.name === choice);
    if (!e) return;
    persist(list.filter(x => x !== e), `Deleted “${e.name}”.`);
    setChoice("");
  };

  return (
    <details className={s.saved}>
      <summary>Saved settings{list.length ? ` (${list.length})` : ""}</summary>
      <div className={s.fields}>
        {list.length > 0 && (
          <div className={u.field}>
            <label className={u.label} htmlFor={`${id}-pick`}>Use saved settings</label>
            <div className={u.control}>
              <select id={`${id}-pick`} className={u.select} value={choice} disabled={disabled} onChange={e => apply(e.target.value)}>
                <option value="">Choose…</option>
                {list.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            {choice && <TextButton className={s.start} disabled={disabled} onClick={remove}>Delete “{choice}”</TextButton>}
          </div>
        )}
        <div className={u.field}>
          <label className={u.label} htmlFor={`${id}-name`}>Save current settings as</label>
          <div className={s.saveRow}>
            <div className={u.control}>
              <input id={`${id}-name`} type="text" maxLength={40} autoComplete="off" value={name} disabled={disabled}
                placeholder="e.g. Client A – Amazon" onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); save(); } }} />
            </div>
            <Button variant="secondary" size="small" disabled={disabled} onClick={save}>Save</Button>
          </div>
          <span className={u.hint}>Kept in this browser only, up to {MAX_SAVED}. Nothing is sent to us.</span>
        </div>
        <p className={s.hintText} role="status">{msg}</p>
      </div>
    </details>
  );
}

"use client";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONSENT_VERSION, earlyAccessSchema, fieldErrors, normalizeContact, type EarlyAccessInput } from "@/lib/validation";
import s from "./earlyAccess.module.css";

type Status = "idle" | "sending" | "done" | "error";
const ROLES = [["seller", "I sell online"], ["cataloguer", "I do listings for sellers"], ["agency", "Agency"], ["other", "Other"]] as const;
const MARKETS = [["amazon", "Amazon"], ["flipkart", "Flipkart"], ["meesho", "Meesho"], ["other", "Other"]] as const;
const VOLUMES = [["under_50", "Under 50"], ["50_200", "50–200"], ["200_1000", "200–1,000"], ["over_1000", "Over 1,000"]] as const;

export function EarlyAccessForm({ source = "home" }: { source?: "home" | "tool" | "guide" }) {
  const id = useId();
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("");
  const [markets, setMarkets] = useState<string[]>([]);
  const [volume, setVolume] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const payload = (): EarlyAccessInput => ({
    contact, role: role as EarlyAccessInput["role"], marketplaces: markets as EarlyAccessInput["marketplaces"],
    monthlyPhotos: volume as EarlyAccessInput["monthlyPhotos"], note, consent: consent as true, consentVersion: CONSENT_VERSION, source, website,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = earlyAccessSchema.safeParse(payload());
    if (!v.success) {
      setErrors(fieldErrors(v.error));
      setStatus("idle");
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-form="${id}"] [aria-invalid="true"]`)?.focus());
      return;
    }
    setErrors({}); setStatus("sending"); setMessage("");
    try {
      const res = await fetch("/api/early-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
      const body = await res.json().catch(() => null);
      if (res.ok) { setStatus("done"); return; }
      if (res.status === 422 && body?.error?.fields) { setErrors(body.error.fields); setStatus("idle"); return; }
      setStatus("error");
      setMessage(res.status === 429 ? "Too many attempts. Please try again in an hour." : body?.error?.message ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setMessage("You seem to be offline. Check your connection and try again.");
    }
  }

  if (status === "done") {
    const c = normalizeContact(contact);
    return (
      <div className={s.done} role="status">
        <strong>You’re on the list.</strong>
        <p>We’ll contact you on {c?.value ?? contact} when founding-user access opens. Reply any time to have your details deleted.</p>
      </div>
    );
  }

  const err = (k: string) => errors[k] ? <span id={`${id}-${k}-e`} className={s.error}>{errors[k]}</span> : null;
  const desc = (k: string) => (errors[k] ? `${id}-${k}-e` : undefined);
  const toggle = (m: string) => setMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <form className={s.form} onSubmit={submit} noValidate data-form={id} aria-describedby={`${id}-privacy`}>
      <div className={s.field}>
        <label htmlFor={`${id}-contact`} className={s.label}>Email or WhatsApp number</label>
        <input id={`${id}-contact`} className={s.input} type="text" inputMode="email" autoComplete="email" value={contact}
          aria-invalid={!!errors.contact} aria-describedby={desc("contact")} onChange={e => setContact(e.target.value)} />
        {err("contact")}
      </div>

      <fieldset className={s.group} aria-invalid={!!errors.role} aria-describedby={desc("role")}>
        <legend className={s.label}>Which describes you?</legend>
        <div className={s.options}>
          {ROLES.map(([v, l]) => (
            <label key={v} className={s.option}><input type="radio" name={`${id}-role`} value={v} checked={role === v} onChange={() => setRole(v)} /> {l}</label>
          ))}
        </div>
        {err("role")}
      </fieldset>

      <fieldset className={s.group} aria-invalid={!!errors.marketplaces} aria-describedby={desc("marketplaces")}>
        <legend className={s.label}>Where do you list products?</legend>
        <div className={s.options}>
          {MARKETS.map(([v, l]) => (
            <label key={v} className={s.option}><input type="checkbox" checked={markets.includes(v)} onChange={() => toggle(v)} /> {l}</label>
          ))}
        </div>
        {err("marketplaces")}
      </fieldset>

      <fieldset className={s.group} aria-invalid={!!errors.monthlyPhotos} aria-describedby={desc("monthlyPhotos")}>
        <legend className={s.label}>Photos you prepare in a month</legend>
        <div className={s.options}>
          {VOLUMES.map(([v, l]) => (
            <label key={v} className={s.option}><input type="radio" name={`${id}-vol`} value={v} checked={volume === v} onChange={() => setVolume(v)} /> {l}</label>
          ))}
        </div>
        {err("monthlyPhotos")}
      </fieldset>

      <div className={s.field}>
        <label htmlFor={`${id}-note`} className={s.label}>What takes you the most time? <span className={s.optional}>Optional</span></label>
        <textarea id={`${id}-note`} className={s.input} rows={3} maxLength={500} value={note}
          aria-invalid={!!errors.note} aria-describedby={desc("note")} onChange={e => setNote(e.target.value)} />
        {err("note")}
      </div>

      <div className={s.hp} aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
      </div>

      <label className={s.consent}>
        <input type="checkbox" checked={consent} aria-invalid={!!errors.consent} aria-describedby={desc("consent")} onChange={e => setConsent(e.target.checked)} />
        <span>Idoconverter may contact me about early access. I can withdraw this and ask for my details to be deleted at any time.</span>
      </label>
      {err("consent")}

      <div className={s.actions}>
        <Button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Join early access"}</Button>
        {status === "error" && <span className={s.error} role="alert">{message}</span>}
      </div>
      <p id={`${id}-privacy`} className={s.small}>
        We store only what you enter here: your email or phone number, what describes you, where you sell, your monthly photo volume, your note, and when you agreed.
        We use it only to contact you about early access and keep it for up to 12 months after your last sign-up. See <a href="/privacy">Privacy</a> for your rights.
      </p>
    </form>
  );
}

"use client";
/* eslint-disable @next/next/no-img-element -- the logo is a local data: URL from this browser's storage */
import { useEffect, useId, useState } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { ColorField, TextField } from "@/components/ui/Field";
import { acceptImages } from "@/lib/image/files";
import { EMPTY_KIT, MAX_COLORS, clearKit, isEmptyKit, loadKit, logoToDataUrl, saveKit, type BrandKit } from "@/lib/brandKit";
import w from "@/components/tool/workbench.module.css";
import s from "./brand.module.css";

export function BrandKitEditor() {
  const id = useId();
  const [kit, setKit] = useState<BrandKit>(EMPTY_KIT);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState("");
  const [logoError, setLogoError] = useState("");
  useEffect(() => { setKit(loadKit()); setLoaded(true); }, []);

  const update = (p: Partial<BrandKit>) => { setKit(k => ({ ...k, ...p })); setMsg(""); };
  const pickLogo = async (list: FileList | null) => {
    if (!list?.length) return;
    const { accepted } = await acceptImages([list[0]]);
    if (!accepted.length) { setLogoError("That file isn’t a JPG, PNG or WebP image."); return; }
    try { update({ logo: await logoToDataUrl(accepted[0]) }); setLogoError(""); }
    catch { setLogoError("Couldn’t read that image. Try another file."); }
  };
  const save = () => {
    const clean = { ...kit, name: kit.name.trim().slice(0, 60) };
    setMsg(saveKit(clean) ? "Brand kit saved on this device." : "Your browser didn’t allow saving. Brand kits can’t be kept in private browsing or when site data is blocked.");
  };
  const clear = () => { clearKit(); setKit(EMPTY_KIT); setMsg("Brand kit cleared from this device."); };

  if (!loaded) return <p className={s.loading}>Loading your brand kit…</p>;
  return (
    <div className={s.editor}>
      <section className={s.fields} aria-labelledby={`${id}-h`}>
        <h2 id={`${id}-h`}>Your brand</h2>
        <TextField label="Shop or brand name" value={kit.name} onChange={v => update({ name: v.slice(0, 60) })} hint="Used as watermark text and in templates." />

        <div className={w.fields}>
          <span className={w.groupLabel} id={`${id}-logo`}>Logo</span>
          {kit.logo ? (
            <div className={w.logoRow}>
              <span className={w.logoThumb}><img src={kit.logo} alt="Your brand logo" /></span>
              <span>Saved at up to 512 px</span>
              <TextButton onClick={() => update({ logo: null })}>Remove logo</TextButton>
            </div>
          ) : (
            <label className={`${w.drop} ${w.dropCompact}`} htmlFor={`${id}-file`}>
              <input id={`${id}-file`} type="file" accept="image/png,image/jpeg,image/webp" aria-describedby={`${id}-logo`} onChange={e => { pickLogo(e.target.files); e.target.value = ""; }} />
              <strong>Choose a logo</strong><span className={w.sub}>PNG with transparency works best</span>
            </label>
          )}
          {logoError && <span className={w.errorText} role="alert">{logoError}</span>}
        </div>

        <fieldset className={`${w.bare} ${w.fields}`}>
          <legend className={w.groupLabel}>Brand colours</legend>
          {kit.colors.map((c, i) => (
            <div key={i} className={s.colorRow}>
              <ColorField label={`Colour ${i + 1}`} value={c} onChange={v => update({ colors: kit.colors.map((x, j) => (j === i ? v : x)) })} />
              <TextButton onClick={() => update({ colors: kit.colors.filter((_, j) => j !== i) })} aria-label={`Remove colour ${i + 1}`}>Remove</TextButton>
            </div>
          ))}
          {kit.colors.length < MAX_COLORS && (
            <TextButton className={w.start} onClick={() => update({ colors: [...kit.colors, kit.colors.length ? "#14171A" : "#1F4FD1"] })}>Add a colour</TextButton>
          )}
        </fieldset>

        <div className={s.actions}>
          <Button onClick={save}>Save brand kit</Button>
          {!isEmptyKit(kit) && <TextButton onClick={clear}>Clear brand kit</TextButton>}
        </div>
        <p className={w.hintText} role="status">{msg}</p>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { HeroDrop } from "@/components/marketing/HeroDrop";
import { EarlyAccessForm } from "@/components/marketing/EarlyAccessForm";
import { Specimen } from "@/components/marketing/Specimen";
import { MARKETPLACES } from "@/lib/presets";
import { TOOLS } from "@/lib/tools";
import { whatsappLink } from "@/lib/config";
import { JsonLd } from "@/components/site/JsonLd";
import { pageMetadata, siteJsonLd } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Idoconverter: marketplace-ready product photos in minutes",
    description: "Make product photos pure white, centred, sized and renamed for Amazon India, Flipkart and Meesho in one batch, with a pass/fail report. Free, in your browser.",
    path: "/",
  }),
  title: { absolute: "Idoconverter: marketplace-ready product photos in minutes" },
};
import s from "@/components/marketing/marketing.module.css";

export default function Home() {
  const wa = whatsappLink("Hi Idoconverter, I’d like my product photos made marketplace-ready.");
  return (
    <>
      <section className={`wrap ${s.hero}`} aria-labelledby="hero-h">
        <div>
          <h1 id="hero-h">Your product photos, marketplace‑ready in minutes.</h1>
          <p className={s.lede}>
            Drop a batch of photos and get them back on <strong>pure white, centred, sized and renamed</strong> for Amazon India, Flipkart or Meesho, with a report on anything that still needs fixing.
          </p>
          <HeroDrop />
        </div>
        <Specimen />
      </section>

      <section className={s.band} aria-labelledby="how-h">
        <div className="wrap">
          <JsonLd data={siteJsonLd()} />
          <h2 id="how-h">One pass, every photo checked</h2>
          <ol className={s.steps}>
            <li><h3>Drop your photos</h3><p>Up to 100 at once, straight from your phone or computer. Nothing is uploaded.</p></li>
            <li><h3>Pick the marketplace</h3><p>Size, fill and file-size limits are set for you. Change anything you need.</p></li>
            <li><h3>Download a ZIP and report</h3><p>Renamed, ready-to-upload images, plus a list of what still needs your attention.</p></li>
          </ol>
          <h3 className={`${s.moreTitle} ${s.spaced}`}>More free tools</h3>
          <ul className={s.moreTools}>
            {TOOLS.filter(t => t.path !== "/product-photos").map(t => (
              <li key={t.path}><Link href={t.path}>{t.name}</Link><span>{t.summary}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section id="rules" className={s.band} aria-labelledby="rules-h">
        <div className="wrap">
          <h2 id="rules-h">Marketplace rules we check</h2>
          <p className={s.intro}>Rules change and differ by category, so every preset shows where its rules come from. A pass means the photo meets the rules we can measure, not that the marketplace will accept it.</p>
          <div className={s.rules}>
            {MARKETPLACES.map(p => (
              <article key={p.key} className={s.rule}>
                <div className={s.ruleHead}>
                  <h3>{p.label} · {p.sub}</h3>
                  {p.verification === "sourced" ? <Tag tone="pass">Sourced</Tag> : <Tag tone="check">Unverified</Tag>}
                </div>
                <ul>{p.rules.map(r => <li key={r}>{r}</li>)}</ul>
                <p className={s.ruleSrc}>{p.source} Last checked {p.checkedOn}.</p>
                <div><ButtonLink href={`/product-photos?preset=${p.key}`} variant="secondary" size="small">Use {p.label} preset</ButtonLink></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {wa && (
        <section className={s.band} aria-labelledby="svc-h">
          <div className="wrap">
            <div className={s.service}>
              <div>
                <h2 id="svc-h">Busy background? We’ll fix it for you.</h2>
                <p className={s.intro}>Send your photos on WhatsApp. They come back marketplace-ready within 24 hours. Your first 10 photos are free.</p>
              </div>
              <ButtonLink href={wa} external>Send photos on WhatsApp</ButtonLink>
            </div>
          </div>
        </section>
      )}

      <section className={s.band} aria-labelledby="guide-h">
        <div className="wrap">
          <h2 id="guide-h">Shoot photos that pass first time</h2>
          <p className={s.intro}>The tool fixes photos taken on a white or light background. You don’t need a studio to take them.</p>
          <ul className={s.tips}>
            <li><strong>A white sheet, curved up</strong><span>Chart paper or a bedsheet behind and under the product, with no visible fold.</span></li>
            <li><strong>Window light, no flash</strong><span>Soft daylight from the side. Direct sun and flash cause hard shadows.</span></li>
            <li><strong>Phone at product height</strong><span>Level with the product, filling most of the screen, with space on every side.</span></li>
          </ul>
          <Link href="/photo-guide" className={s.more}>Read the full photo guide</Link>
        </div>
      </section>

      <section id="early-access" className={s.band} aria-labelledby="ea-h">
        <div className="wrap">
          <h2 id="ea-h">Become a founding user</h2>
          <p className={s.intro}>We’re building saved workflows, background removal and more for sellers who prepare photos every week. Tell us how you work and we’ll invite you first.</p>
          <div className={s.spaced}><EarlyAccessForm source="home" /></div>
        </div>
      </section>

      <section id="faq" className={s.band} aria-labelledby="faq-h">
        <div className="wrap">
          <h2 id="faq-h">Questions</h2>
          <div className={s.faq}>
            <details><summary>Are my photos uploaded anywhere?</summary><p>No. Processing happens in your browser, on your own device. The output files also drop EXIF data such as camera details and location.</p></details>
            <details><summary>Does “Pass” mean the marketplace will accept my photo?</summary><p>No. It means the photo meets the published rules we can measure: background colour, how much of the frame the product fills, pixel size and file size. Marketplaces also judge things we can’t, such as focus, text on the image, or whether it shows the right product.</p></details>
            <details><summary>What if my background isn’t white?</summary><p>We flag the photo and leave it out of the ZIP. Background removal isn’t in the tool yet. Reshoot on white using the photo guide{wa ? ", or send it to us on WhatsApp to fix" : ""}.</p></details>
            <details><summary>How many photos can I do at once?</summary><p>Up to 100 per batch, each under 30 MB and 40 megapixels. Large batches can take a minute or two on older phones; a laptop is faster.</p></details>
            <details><summary>Does it cost anything?</summary><p>It’s free while we’re in early access. If we add paid plans later, we’ll say so clearly before you use anything that costs money.</p></details>
            <details><summary>How do I get Amazon file names right?</summary><p>Rename your original photos to the product’s ASIN first (for example B0XXXXXXXX.jpg). With the Amazon preset, the output becomes B0XXXXXXXX.MAIN.jpg, ready for bulk upload.</p></details>
          </div>
        </div>
      </section>
    </>
  );
}

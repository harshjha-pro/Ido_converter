import { Suspense } from "react";
import { Workbench } from "@/components/tool/Workbench";
import s from "./page.module.css";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { pageMetadata, webAppJsonLd } from "@/lib/seo";
import { LIMITS } from "@/lib/config";
import { MARKETPLACES } from "@/lib/presets";
import { Tag } from "@/components/ui/Tag";
import Link from "next/link";
import m from "@/components/marketing/marketing.module.css";

const TITLE = "Product photo resizer for Amazon, Flipkart & Meesho";
const DESC = "Batch-fix product photos in your browser: pure white background, centred, sized, compressed and renamed for Amazon India, Flipkart and Meesho, with a pass/fail report.";
export const metadata = pageMetadata({ title: TITLE, description: DESC, path: "/product-photos" });

export default function ProductPhotos() {
  return (
    <>
      <div className={`wrap ${s.page}`}>
        <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Product photos", path: "/product-photos" }]} />
        <header className={s.head}>
          <h1>Product photos</h1>
          <p className="muted">Centre, whiten, size and rename a batch for your marketplace, then check every result. Photos stay on your device.</p>
        </header>
        <Suspense fallback={<div className={s.toolPlaceholder} aria-busy="true"><span className="muted">Loading the tool…</span></div>}>
          <Workbench />
        </Suspense>
      </div>

      <section className={`${m.band} ${m.bandAfterTool}`} aria-labelledby="presets-h">
        <div className="wrap">
          <h2 id="presets-h">What each marketplace preset does</h2>
          <p className={m.intro}>Each preset sets the output size, how much of the frame the product fills, a file-size cap and a naming pattern. You can change any of them before processing.</p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className="visually-hidden">Marketplace preset settings</caption>
              <thead>
                <tr><th scope="col">Preset</th><th scope="col">Output</th><th scope="col">Product fill</th><th scope="col">File-size cap</th><th scope="col">Minimum original</th><th scope="col">File names</th><th scope="col">Rules</th></tr>
              </thead>
              <tbody>
                {MARKETPLACES.map(p => (
                  <tr key={p.key}>
                    <th scope="row"><Link href={`/product-photos?preset=${p.key}`}>{p.label}</Link><span className={s.sub}>{p.sub}</span></th>
                    <td>{p.size.toLocaleString("en-IN")} × {p.size.toLocaleString("en-IN")} px</td>
                    <td>{p.fill}%</td>
                    <td>{p.maxKB.toLocaleString("en-IN")} KB</td>
                    <td>{p.minSide.toLocaleString("en-IN")} px longest side</td>
                    <td>{p.pattern}.jpg</td>
                    <td>{p.verification === "sourced" ? <Tag tone="pass">Sourced</Tag> : <Tag tone="check">Unverified</Tag>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className={s.sources}>
            {MARKETPLACES.map(p => <li key={p.key}><strong>{p.label}:</strong> {p.source} Last checked {p.checkedOn}.</li>)}
          </ul>
          <p className={s.sources}>Flipkart and Meesho rules come from third-party seller guides, not the marketplaces themselves, so treat those presets as a starting point and check your category’s rules in your seller panel.</p>
        </div>
      </section>

      <section className={m.band} aria-labelledby="results-h">
        <div className="wrap">
          <h2 id="results-h">What Pass, Check and Fail mean</h2>
          <p className={m.intro}>Every photo is measured against the preset. A result is a technical pre-check of what we can measure, not a promise that the marketplace will accept the photo. We can’t judge text, logos, props or focus.</p>
          <ul className={m.tips}>
            <li><strong><Tag tone="pass">Pass</Tag></strong><span>White background, product found and centred at the target fill, output at the preset size and under the file-size cap.</span></li>
            <li><strong><Tag tone="check">Check</Tag></strong><span>Included in the ZIP, but look at it first: the product touches the photo’s edge, it was enlarged a lot and may look soft, the original is smaller than the preset’s minimum, the background is near-white, or the file is still over the cap.</span></li>
            <li><strong><Tag tone="fail">Fail</Tag></strong><span>Left out of the ZIP: the background isn’t white or light (it needs background removal), no product could be found, or the file couldn’t be read or is over {LIMITS.maxMegapixels} MP or 30 MB.</span></li>
          </ul>
          <p className={s.sources}>Busy backgrounds can’t be fixed here yet. <Link href="/photo-guide">The photo guide</Link> shows how to reshoot on white with a phone. For other formats and sizes, use the <Link href="/tools/image-converter">bulk image converter</Link>.</p>
        </div>
      </section>

      <section className={m.band} aria-labelledby="pp-faq">
        <div className="wrap">
          <h2 id="pp-faq">Questions</h2>
          <div className={m.faq}>
            <details><summary>Are my photos uploaded?</summary><p>No. Photos are processed in your browser and never leave your device. We only receive anonymous counts, such as how many photos passed, and not if your browser sends Global Privacy Control. See the <Link href="/privacy">privacy notice</Link>.</p></details>
            <details><summary>Can I prepare photos for two marketplaces?</summary><p>Yes, one at a time: process the batch with one preset and download the ZIP, then pick the other preset and select Process again. Each ZIP has its own folder and report.</p></details>
            <details><summary>Why are my files named ASIN.MAIN.jpg for Amazon?</summary><p>Amazon’s bulk image upload matches files to listings by name. Name your originals by ASIN and the preset adds .MAIN. Change the pattern in File names if you upload another way.</p></details>
            <details><summary>What’s in the report?</summary><p>A CSV with each original and output name, the result, the reasons, input and output sizes, the product fill and the background. It opens in Excel or Google Sheets.</p></details>
            <details><summary>How many photos can I do at once?</summary><p>Up to {LIMITS.maxFiles} photos per batch, JPG, PNG or WebP, each under 30 MB and {LIMITS.maxMegapixels} megapixels. Older phones may be slower with large batches.</p></details>
          </div>
        </div>
      </section>
      <JsonLd data={webAppJsonLd("Idoconverter product photo tool", DESC, "/product-photos")} />
    </>
  );
}

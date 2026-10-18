import { WatermarkWorkbench } from "@/components/tool/WatermarkWorkbench";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { pageMetadata, webAppJsonLd } from "@/lib/seo";
import Link from "next/link";
import m from "@/components/marketing/marketing.module.css";
import s from "../../product-photos/page.module.css";

const TITLE = "Add a watermark to photos in bulk";
const DESC = "Stamp your shop name or logo on up to 100 photos at once: choose the position, size and opacity, or repeat it across the image. Runs in your browser; nothing is uploaded.";
export const metadata = pageMetadata({ title: TITLE, description: DESC, path: "/tools/watermark" });

export default function WatermarkPage() {
  return (
    <>
      <div className={`wrap ${s.page}`}>
        <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "Watermark", path: "/tools/watermark" }]} />
        <header className={s.head}>
          <h1>Add a watermark to photos</h1>
          <p className="muted">Put your shop name, website or logo on a whole batch of photos in one go. Everything happens in your browser.</p>
        </header>
        <WatermarkWorkbench />
      </div>

      <section className={`${m.band} ${m.bandAfterTool}`} aria-labelledby="wm-when">
        <div className="wrap">
          <h2 id="wm-when">When a watermark helps, and when it doesn’t</h2>
          <div className={m.rules}>
            <article className={m.rule}><h3>Social posts and catalogues</h3><p>A small corner mark keeps your name on photos that get shared or forwarded on WhatsApp, Instagram or Facebook.</p></article>
            <article className={m.rule}><h3>Previews you send to buyers</h3><p>Repeat the mark across the image for proofs or samples, so a screenshot isn’t useful without paying.</p></article>
            <article className={m.rule}><h3>Not on marketplace main images</h3><p>Amazon’s main-image rules don’t allow text, logos or watermarks, and other marketplaces discourage them. Keep watermarks for your own channels.</p></article>
          </div>
          <p className={s.sources}>Need white-background marketplace photos instead? Use the <Link href="/product-photos">product photo tool</Link>. To change formats or sizes without a watermark, use the <Link href="/tools/image-converter">image converter</Link>.</p>
        </div>
      </section>

      <section className={m.band} aria-labelledby="wm-faq">
        <div className="wrap">
          <h2 id="wm-faq">Questions</h2>
          <div className={m.faq}>
            <details><summary>Are my photos or logo uploaded?</summary><p>No. Both stay on your device; the watermark is drawn in your browser.</p></details>
            <details><summary>Can a watermark stop copying completely?</summary><p>No. It makes casual copying less useful and keeps your name on shared photos, but a determined person can crop or edit it out. A mark repeated across the image is harder to remove than one in a corner.</p></details>
            <details><summary>Which logo file works best?</summary><p>A PNG with a transparent background, so only the logo shows. A JPG logo keeps its background box.</p></details>
            <details><summary>Can I watermark someone else’s photos?</summary><p>Only add marks to images you own or have permission to use. Putting your name on someone else’s work doesn’t make it yours.</p></details>
            <details><summary>Is there a limit?</summary><p>Up to 100 images per batch, each under 30 MB and 40 megapixels. The logo must also be a JPG, PNG or WebP.</p></details>
          </div>
        </div>
      </section>
      <JsonLd data={webAppJsonLd("Idoconverter bulk watermark tool", DESC, "/tools/watermark")} />
    </>
  );
}

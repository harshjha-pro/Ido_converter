import { ConverterWorkbench } from "@/components/tool/ConverterWorkbench";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { pageMetadata, webAppJsonLd } from "@/lib/seo";
import m from "@/components/marketing/marketing.module.css";
import s from "../../product-photos/page.module.css";

const TITLE = "Bulk image converter: JPG, PNG and WebP";
const DESC = "Convert up to 100 images at once between JPG, PNG and WebP. Resize, compress, rotate and flip in your browser, then download a ZIP. Images aren’t uploaded.";
export const metadata = pageMetadata({ title: TITLE, description: DESC, path: "/tools/image-converter" });

export default function ImageConverterPage() {
  return (
    <>
      <div className={`wrap ${s.page}`}>
        <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Image converter", path: "/tools/image-converter" }]} />
        <header className={s.head}>
          <h1>Bulk image converter</h1>
          <p className="muted">Convert JPG, PNG and WebP images, resize and compress them, rotate or flip them, all in one batch. Everything happens in your browser.</p>
        </header>
        <ConverterWorkbench />
      </div>

      <section className={`${m.band} ${m.bandAfterTool}`} aria-labelledby="fmt-h">
        <div className="wrap">
          <h2 id="fmt-h">Which format should you choose?</h2>
          <div className={m.rules}>
            <article className={m.rule}><h3>JPG</h3><p>Best for photographs. Small files and supported everywhere, including every marketplace. No transparency: transparent areas become white.</p></article>
            <article className={m.rule}><h3>PNG</h3><p>Best for logos, screenshots and graphics with sharp edges or transparency. Lossless, so photos saved as PNG are usually much larger than JPG.</p></article>
            <article className={m.rule}><h3>WebP</h3><p>Best for your own website. Usually smaller than JPG at similar quality, and supports transparency. Check that the place you’re uploading to accepts WebP.</p></article>
          </div>
        </div>
      </section>

      <section className={m.band} aria-labelledby="cv-faq">
        <div className="wrap">
          <h2 id="cv-faq">Questions</h2>
          <div className={m.faq}>
            <details><summary>Are my images uploaded?</summary><p>No. Conversion runs in your browser on your device. The converted files don’t keep EXIF data such as camera details or location.</p></details>
            <details><summary>Why is my converted file bigger than the original?</summary><p>Converting a photo to PNG, or re-saving a compressed JPG at high quality, can make it larger. The tool tells you when that happens; choose JPG or WebP, or lower the quality.</p></details>
            <details><summary>Can I convert HEIC, GIF or SVG?</summary><p>Not yet. The converter accepts JPG, PNG and WebP. iPhones usually convert HEIC photos to JPG when you share or email them.</p></details>
            <details><summary>Why did WebP come out as PNG?</summary><p>Some older browsers, including older versions of Safari, can’t save WebP. The tool saves the closest format it can and tells you. Using a current version of Chrome, Edge or Firefox fixes this.</p></details>
            <details><summary>Is there a limit?</summary><p>Up to 100 images per batch, each under 30 MB and 40 megapixels.</p></details>
          </div>
        </div>
      </section>
      <JsonLd data={webAppJsonLd("Idoconverter bulk image converter", DESC, "/tools/image-converter")} />
    </>
  );
}

import { Suspense } from "react";
import { Workbench } from "@/components/tool/Workbench";
import s from "./page.module.css";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { JsonLd } from "@/components/site/JsonLd";
import { pageMetadata, webAppJsonLd } from "@/lib/seo";

const TITLE = "Product photo resizer for Amazon, Flipkart & Meesho";
const DESC = "Batch-fix product photos in your browser: pure white background, centred, sized, compressed and renamed for Amazon India, Flipkart and Meesho, with a pass/fail report.";
export const metadata = pageMetadata({ title: TITLE, description: DESC, path: "/product-photos" });

export default function ProductPhotos() {
  return (
    <div className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Product photos", path: "/product-photos" }]} />
      <header className={s.head}>
        <h1>Product photos</h1>
        <p className="muted">Centre, whiten, size and rename a batch for your marketplace, then check every result. Photos stay on your device.</p>
      </header>
      <Suspense fallback={<div className={s.toolPlaceholder} aria-busy="true"><span className="muted">Loading the tool…</span></div>}>
        <Workbench />
      </Suspense>
      <JsonLd data={webAppJsonLd("Idoconverter product photo tool", DESC, "/product-photos")} />
    </div>
  );
}

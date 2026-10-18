import Link from "next/link";
import { BrandKitEditor } from "@/components/brand/BrandKitEditor";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import s from "@/components/marketing/marketing.module.css";

// Personal settings page: no search value, so it stays out of the index and the sitemap.
export const metadata = pageMetadata({
  title: "Brand kit",
  description: "Save your shop name, logo and brand colours in this browser to reuse them in watermarks and templates. Nothing is uploaded.",
  path: "/brand-kit",
  noindex: true,
});

export default function BrandKitPage() {
  return (
    <div className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "Brand kit", path: "/brand-kit" }]} />
      <h1>Brand kit</h1>
      <p className={s.intro}>Save your shop name, logo and colours once, then use them in the <Link href="/tools/watermark">watermark tool</Link>. They’re kept in this browser only: nothing is uploaded, and they won’t appear on your other devices.</p>
      <BrandKitEditor />
    </div>
  );
}

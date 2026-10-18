import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { LIMITS } from "@/lib/config";
import { TOOLS } from "@/lib/tools";
import s from "@/components/marketing/marketing.module.css";

export const metadata = pageMetadata({
  title: "Free image tools for online sellers",
  description: "Every Idoconverter tool in one place: marketplace product photos, a bulk image converter and a bulk watermark tool. All free, all in your browser.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className={`wrap ${s.page} ${s.wide}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }]} />
      <h1>Image tools</h1>
      <p className={s.intro}>Each tool works on up to {LIMITS.maxFiles} images at once and runs in your browser, so your photos never leave your device.</p>
      <ul className={s.toolList}>
        {TOOLS.map(t => (
          <li key={t.path}>
            <h2><Link href={t.path}>{t.name}</Link></h2>
            <p>{t.summary}</p>
            <p className={s.toolFor}>Best for: {t.bestFor}</p>
          </li>
        ))}
      </ul>
      <p className={s.spaced}>Use the same shop name, logo and colours every time: save them once in your <Link href="/brand-kit">brand kit</Link>. It stays in this browser.</p>
      <p>Not sure where to start? If you sell on a marketplace, start with <Link href="/product-photos">product photos</Link>, then read the <Link href="/photo-guide">photo guide</Link> for shots that pass first time.</p>
    </div>
  );
}

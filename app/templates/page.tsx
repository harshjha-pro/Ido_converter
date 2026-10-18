import Link from "next/link";
import { TemplateGallery } from "@/components/templates/TemplateGallery";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import m from "@/components/marketing/marketing.module.css";
import s from "../product-photos/page.module.css";

export const metadata = pageMetadata({
  title: "Free post, story and thumbnail templates for sellers",
  description: "Editable templates for sale posts, new arrivals, festive offers, tips and YouTube thumbnails. Change the text, colours and photo, then download. In your browser.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <>
      <div className={`wrap ${s.page}`}>
        <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Templates", path: "/templates" }]} />
        <header className={s.head}>
          <h1>Templates for posts, stories and thumbnails</h1>
          <p className="muted">Pick a template, change the words, colours and photo, and download it at the right size. Your photos stay on your device.</p>
        </header>
        <TemplateGallery />
      </div>

      <section className={`${m.band} ${m.bandAfterTool}`} aria-labelledby="tpl-faq">
        <div className="wrap">
          <h2 id="tpl-faq">Questions</h2>
          <div className={m.faq}>
            <details><summary>Can I change everything?</summary><p>You can change every piece of text and its size, all four colours, the photo and how it fits, and add your logo. The layout of each template is fixed, so it stays tidy on small screens.</p></details>
            <details><summary>Can I use my brand colours and logo?</summary><p>Yes. Save them once in your <Link href="/brand-kit">brand kit</Link>, then choose “Use my brand kit” in the editor.</p></details>
            <details><summary>What sizes are the downloads?</summary><p>Square posts are 1080 × 1080 px, portrait posts 1080 × 1350 px, stories 1080 × 1920 px and YouTube thumbnails 1280 × 720 px. Download as PNG or JPG.</p></details>
            <details><summary>Are the templates free to use?</summary><p>Yes, for your own business posts. They’re our own designs, and the photos you add stay yours.</p></details>
            <details><summary>Is my work saved?</summary><p>Your text and colours are saved in this browser so you can come back to a template. Photos aren’t saved: add them again next time.</p></details>
          </div>
        </div>
      </section>
    </>
  );
}

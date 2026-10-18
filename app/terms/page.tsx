import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import s from "@/components/marketing/marketing.module.css";

// DRAFT: requires review by a qualified lawyer before public launch (docs/LEGAL_READINESS.md).
export const metadata = pageMetadata({ title: "Terms of use", description: "The terms for using Idoconverter’s free image tools, templates and early-access programme, including watermark and template use.", path: "/terms" });

export default function Terms() {
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }]} />
      <h1>Terms of use</h1>
      <p className={s.updated}>Last updated 18 October 2026</p>

      <h2>The service</h2>
      <p>Idoconverter provides free, browser-based tools for preparing images. The tools run on your device; we don’t receive the images you process with them. The service is offered during early access and may change, or be paused, at any time.</p>

      <h2>Your images</h2>
      <p>Only process images you own or have permission to edit. You remain responsible for the images you use, including whether they may be published on any marketplace or website.</p>

      <h2>Watermarks</h2>
      <p>Only add watermarks, names or logos that you’re entitled to use, and only to images you own or may edit. Don’t use the tools to remove, cover or replace someone else’s watermark or credit.</p>

      <h2>Templates</h2>
      <p>Our templates are free to use for your own business posts, including commercial ones. You may edit them and publish the designs you make. Don’t sell or redistribute the templates themselves as templates. The text, photos and logos you add remain yours and your responsibility.</p>

      <h2>Marketplace checks</h2>
      <p>Checks and presets are based on published rules we’ve been able to verify, and on third-party guides where marked “Unverified”. A “Pass” is a technical pre-check, not a promise that any marketplace will accept a photo. Always confirm current rules in your seller panel.</p>

      <h2>Acceptable use</h2>
      <p>Don’t use the site or its forms to send spam, attempt to disrupt the service, get around its limits, or submit someone else’s contact details.</p>

      <h2>No warranty</h2>
      <p>The tools are provided as they are. Keep your original images: always check results before you publish them.</p>

      <h2>Early access and your data</h2>
      <p>If you join early access, we use your details as described in our <Link href="/privacy">privacy notice</Link>. Settings, brand kits and template drafts are kept only in your own browser.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>Changes</h2>
      <p>We’ll update this page if these terms change, and note the date above.</p>
    </article>
  );
}

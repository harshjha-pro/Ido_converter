import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import s from "@/components/marketing/marketing.module.css";

// DRAFT: requires review by a qualified lawyer before public launch (docs/LEGAL_READINESS.md).
export const metadata = pageMetadata({ title: "Terms of use", description: "The terms for using Idoconverter’s free image tools and early-access programme.", path: "/terms" });

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

      <h2>Marketplace checks</h2>
      <p>Checks and presets are based on published rules we’ve been able to verify, and on third-party guides where marked “Unverified”. A “Pass” is a technical pre-check, not a promise that any marketplace will accept a photo. Always confirm current rules in your seller panel.</p>

      <h2>Acceptable use</h2>
      <p>Don’t use the site or its forms to send spam, attempt to disrupt the service, get around its limits, or submit someone else’s contact details.</p>

      <h2>No warranty</h2>
      <p>The tools are provided as they are. Keep your original images: always check results before you publish them.</p>

      <h2>Early access and your data</h2>
      <p>If you join early access, we use your details as described in our <a href="/privacy">privacy notice</a>.</p>

      <h2>Changes</h2>
      <p>We’ll update this page if these terms change, and note the date above.</p>
    </article>
  );
}

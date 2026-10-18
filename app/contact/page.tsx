import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SITE } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";
import s from "@/components/marketing/marketing.module.css";

export const metadata = pageMetadata({
  title: "Contact Idoconverter",
  description: "Email Idoconverter for help with a tool, privacy and data-deletion requests, or to report a problem. Here’s what to include so we can help quickly.",
  path: "/contact",
});

export default function Contact() {
  const email = SITE.supportEmail;
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <h1>Contact</h1>
      {email ? (
        <p className={s.intro}>Email us at <a href={`mailto:${email}`}>{email}</a>. We read every message.</p>
      ) : (
        <p className={s.intro}>We’re setting up our contact address. It will appear here soon.</p>
      )}

      <h2>Help with a tool</h2>
      <p>Tell us which tool you used, what you expected and what happened, and your phone or browser (for example “Chrome on Android”). Please don’t attach customer data. If a photo is the problem, attach only a photo you’re happy to share.</p>

      <h2>Privacy and your data</h2>
      <p>To see, correct or delete the details you gave us for early access, or to withdraw your consent, email us from the address you signed up with, or tell us the phone number you used. The <Link href="/privacy">privacy notice</Link> explains your rights.</p>
      <p>Your images are never uploaded, so we have no copies of them to delete. Settings, brand kits and template drafts are stored only in your own browser; clear them there.</p>

      <h2>Report a problem or misuse</h2>
      <p>If you think someone used Idoconverter to put a watermark or name on your images without permission, or you’ve found a security issue, email us with the details. We never ask for passwords or payment details by email.</p>
    </article>
  );
}

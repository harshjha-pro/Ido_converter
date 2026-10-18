import s from "@/components/marketing/marketing.module.css";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SITE } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

// DRAFT: self-reviewed against the DPDP Act 2023 and DPDP Rules 2025 structure, not by a lawyer (docs/LEGAL_READINESS.md).
export const metadata = pageMetadata({ title: "Privacy notice", description: "How Idoconverter handles your images, early-access details and anonymous usage statistics, and how to use your privacy rights.", path: "/privacy" });

function Contact() {
  if (SITE.supportEmail) return <>email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></>;
  return <>use the contact address we’ll publish on this page. We’re setting it up now; until it appears, there’s no channel for requests, so please don’t send us personal details</>;
}

export default function Privacy() {
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }]} />
      <h1>Privacy</h1>
      <p className={s.updated}>Last updated 18 October 2026</p>

      <h2>Who we are</h2>
      <p>This notice covers {SITE.url.replace(/^https?:\/\//, "")} (“Idoconverter”, “we”). For questions or privacy requests, <Contact />.</p>

      <h2>Your images</h2>
      <p>Every Idoconverter tool processes images in your web browser, on your own device. Your images are not uploaded to our servers or to anyone else. When you close or refresh the page, they are gone from the tool.</p>
      <p>Processed images are saved as new files. These do not include the EXIF data from your originals, such as camera details or location.</p>
      <p>Some tools can remember things for you: saved settings, your brand kit (shop name, logo and colours) and the text and colours of a template you’re editing. These are saved only in your own browser’s storage, never sent to us, and you can clear them in the tool or in your browser settings.</p>

      <h2>What we collect, and why</h2>
      <p>There are no accounts, no cookies and no third-party analytics.</p>
      <p><strong>Early-access sign-ups.</strong> If you fill in the early-access form, we store:</p>
      <ul className={s.list}>
        <li>your email address or phone number</li>
        <li>what describes you (seller, cataloguer, agency or other)</li>
        <li>which marketplaces you sell on</li>
        <li>your monthly photo volume</li>
        <li>your note, if you write one</li>
        <li>which page you signed up from, when you agreed, and the version of the wording you agreed to</li>
      </ul>
      <p>We use these only to contact you about early access and to understand who the product is for. We keep them for up to 12 months after your last sign-up, or until you withdraw your consent or ask us to delete them.</p>
      <p><strong>Anonymous batch statistics.</strong> When a product-photo batch finishes, the tool sends a summary of counts and settings: which marketplace preset, how many photos, how many passed, needed a check or failed, how long it took, the output size and whether you used a phone, tablet or computer. It contains no images, file names, IP address or anything that identifies you. We use it to understand whether the tool is useful and keep it for up to 24 months. If your browser sends the Global Privacy Control signal, nothing is sent.</p>
      <p><strong>Abuse protection.</strong> To limit automated abuse of our forms, we count requests per visitor for one hour using a one-way scrambled code made from your IP address. The IP address itself is never stored, and the counts are deleted within a day.</p>
      <p><strong>Server logs.</strong> Like any website, our hosting provider keeps standard server logs, such as IP addresses and the pages requested, for security and reliability.</p>
      <p>We don’t sell your details or share them with anyone, except our hosting provider, which stores them for us.</p>

      <h2>If you contact us</h2>
      <p>If you message us or send photos for our done-for-you service, we receive what you send, including your phone number or email. We use it only to do the work you asked for and reply to you, and we delete photos once the job is finished.</p>

      <h2>Your rights</h2>
      <p>Under India’s Digital Personal Data Protection Act, 2023, you can:</p>
      <ul className={s.list}>
        <li>ask what personal data we hold about you and how we use it</li>
        <li>ask us to correct, complete or update it</li>
        <li>withdraw your consent at any time, as easily as you gave it, and ask us to delete your data</li>
        <li>nominate someone to act for you if you die or become unable to act</li>
        <li>raise a grievance with us, and get a response</li>
      </ul>
      <p>To use any of these rights, <Contact />. If you’re not satisfied with our response, you can complain to the Data Protection Board of India.</p>

      <h2>Changes</h2>
      <p>If we add accounts, payments or AI features that send images to another service, we’ll update this page first and tell you clearly in the tool before anything leaves your device.</p>
    </article>
  );
}

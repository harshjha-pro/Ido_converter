import s from "@/components/marketing/marketing.module.css";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Privacy notice", description: "How Idoconverter handles your images, early-access details and anonymous usage statistics.", path: "/privacy" });

export default function Privacy() {
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }]} />
      <h1>Privacy</h1>
      <p className={s.updated}>Last updated 18 October 2026</p>

      <h2>Your photos</h2>
      <p>The Product photos tool processes images in your web browser, on your own device. Your photos are not uploaded to our servers or to anyone else. When you close or refresh the page, they are gone from the tool.</p>
      <p>Processed images are saved as new JPEG files. These do not include the EXIF data from your originals, such as camera details or location.</p>

      <h2>What we collect</h2>
      <p>There are no accounts, no cookies and no third-party analytics.</p>
      <p><strong>Anonymous batch statistics.</strong> When a batch finishes, the tool sends a summary of counts and settings: which marketplace preset, how many photos, how many passed, needed a check or failed, how long it took, the output size and whether you used a phone, tablet or computer. It contains no images, file names, IP address or anything that identifies you. We use it to understand whether the tool is useful. If your browser sends the Global Privacy Control signal, nothing is sent.</p>
      <p><strong>Early-access sign-ups.</strong> If you fill in the early-access form, we store your email or phone number and your answers. We use them only to contact you about early access, and keep them for up to 12 months after your last sign-up, or until you ask us to delete them.</p>
      <p><strong>Abuse protection.</strong> To limit automated abuse, we count requests per visitor for one hour using a one-way scrambled code made from your IP address. The IP address itself is never stored, and the counts are deleted within a day.</p>
      <p>Like any website, our hosting provider keeps standard server logs, such as IP addresses and the pages requested, for security and reliability.</p>

      <h2>If you contact us</h2>
      <p>If you message us on WhatsApp or send photos for our done-for-you service, we receive what you send, including your phone number. We use it only to do the work you asked for and reply to you, and we delete photos once the job is finished.</p>

      <h2>Changes</h2>
      <p>If we add accounts, payments or AI features that send images to another service, we’ll update this page first and tell you clearly in the tool before anything leaves your device.</p>
    </article>
  );
}

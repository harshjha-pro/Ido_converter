import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import s from "@/components/marketing/marketing.module.css";

export const metadata = pageMetadata({
  title: "About Idoconverter",
  description: "Why Idoconverter exists, who it’s for, and how it keeps your product photos private by processing them in your browser instead of on a server.",
  path: "/about",
});

export default function About() {
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <h1>About Idoconverter</h1>
      <p className={s.intro}>Idoconverter helps small online sellers in India get product photos ready for Amazon, Flipkart and Meesho without a designer or a studio.</p>

      <h2>Why we built it</h2>
      <p>Each marketplace has its own rules for product photos: background, size, how much of the frame the product fills, and file size. Preparing photos by hand for several marketplaces is slow, and a photo that breaks a rule can delay a listing. Idoconverter does the routine work in one pass and tells you, photo by photo, what still needs attention.</p>

      <h2>Who it’s for</h2>
      <ul>
        <li>Sellers who shoot their own products on a phone.</li>
        <li>Cataloguers who prepare listings for several sellers.</li>
        <li>Anyone who needs to convert, resize or watermark a batch of images quickly.</li>
      </ul>

      <h2>How it works</h2>
      <p>The tools run in your web browser, on your own device. Your photos are not uploaded to our servers. That keeps them private and means the tools work as fast as your device allows. The <Link href="/privacy">privacy notice</Link> explains the little we do collect.</p>
      <p>Our checks are based on published marketplace rules where we could find them, and on third-party guides where we couldn’t, which we label “Unverified”. A pass is a technical pre-check, not a guarantee that a marketplace will accept a photo.</p>

      <h2>Where we are</h2>
      <p>Idoconverter is in early access and free to use. We’re talking to sellers to learn what to build next. See <Link href="/pricing">pricing</Link> for what may come later, or <Link href="/#early-access">join early access</Link> to help shape it. Questions? <Link href="/contact">Contact us</Link>.</p>
    </article>
  );
}

import { ButtonLink } from "@/components/ui/Button";
import s from "@/components/marketing/marketing.module.css";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Product photos on a white background with a phone",
  description: "A simple setup for product photos that pass marketplace checks: white backdrop, window light and the right phone position. No studio needed.",
  path: "/photo-guide",
});

export default function PhotoGuide() {
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Photo guide", path: "/photo-guide" }]} />
      <h1>Shoot product photos that pass first time</h1>
      <p className={s.intro}>You don’t need a studio or a new camera. This setup uses a phone, a window and a white sheet, and gives photos that Idoconverter can turn into clean, marketplace-ready images automatically.</p>

      <h2>Set up</h2>
      <ol>
        <li><strong>Make a curved white backdrop.</strong> Tape chart paper or a white bedsheet to a wall and let it curve down onto the table. The curve hides the line where wall meets table.</li>
        <li><strong>Use window light.</strong> Put the table beside a window with daylight coming from the side. Avoid direct sun; if it’s sunny, hang a thin white cloth over the window.</li>
        <li><strong>Turn off the flash.</strong> Flash creates hard shadows and shiny spots, especially on glass and metal.</li>
        <li><strong>Hold the phone at product height.</strong> Shoot straight on, not from above, and let the product fill most of the screen with a little white space on every side.</li>
        <li><strong>Use the main camera at full resolution.</strong> Wipe the lens first. Avoid digital zoom; move closer instead.</li>
      </ol>

      <h2>Common problems</h2>
      <ul>
        <li><strong>Grey background:</strong> the room is too dark. Shoot closer to the window or at a brighter time of day. Slightly grey-white is fine; the tool cleans it to pure white.</li>
        <li><strong>Product cut off:</strong> leave space around every edge. The tool can’t add back a part of the product that wasn’t photographed.</li>
        <li><strong>Blurry or soft:</strong> rest your elbows on the table, tap to focus on the product, and keep the phone still.</li>
        <li><strong>White product on white:</strong> add a soft shadow by moving it slightly away from the window, or use a very light grey backdrop and keep the tool’s cleaning turned on.</li>
      </ul>

      <h2>Keep it consistent</h2>
      <p>Shoot every product with the same setup and distance. A catalogue where every photo matches looks more trustworthy, and the tool gives more consistent results.</p>

      <div className={s.callout}>
        <p>Photos ready? Drop them in and check them against your marketplace’s rules.</p>
        <ButtonLink href="/product-photos">Fix my photos</ButtonLink>
      </div>
    </article>
  );
}

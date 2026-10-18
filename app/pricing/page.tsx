import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { LIMITS } from "@/lib/config";
import { TOOLS } from "@/lib/tools";
import s from "@/components/marketing/marketing.module.css";

export const metadata = pageMetadata({
  title: "Pricing: free during early access",
  description: "Every Idoconverter tool is free while we’re in early access, with no sign-up and no watermark on your results. Here’s what’s included and what may come later.",
  path: "/pricing",
});

export default function Pricing() {
  return (
    <article className={`wrap ${s.page}`}>
      <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]} />
      <h1>Free during early access</h1>
      <p className={s.intro}>Every tool is free while we’re in early access. There’s no account to create, nothing to install, and we don’t add our own watermark to your results.</p>

      <h2>What’s included now</h2>
      <ul>
        {TOOLS.map(t => <li key={t.path}><Link href={t.path}>{t.name}</Link>: {t.summary}</li>)}
        <li>Up to {LIMITS.maxFiles} images per batch, each under 30 MB and {LIMITS.maxMegapixels} megapixels.</li>
        <li>Downloads one by one or as a ZIP, and a CSV report for product photos.</li>
      </ul>

      <h2>What may cost money later</h2>
      <p>We haven’t set any prices. We’re talking to sellers first to learn what’s worth paying for. Ideas we’re exploring:</p>
      <ul>
        <li>Background removal for photos taken on a busy background. This needs an outside service that charges us per image, so it would likely be sold in credits.</li>
        <li>Saved workflows and brand kits that follow you across devices, which needs an account.</li>
        <li>Larger batches and multi-client workspaces for cataloguers and agencies.</li>
      </ul>
      <p>None of these exist yet. If we start charging for anything, we’ll say so on this page first.</p>

      <div className={s.callout}>
        <p>Prepare photos every week? Tell us how you work and we’ll invite you to shape what comes next.</p>
        <ButtonLink href="/#early-access">Join early access</ButtonLink>
      </div>
    </article>
  );
}

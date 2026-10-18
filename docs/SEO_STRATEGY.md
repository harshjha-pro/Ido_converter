# SEO strategy

_Covers the keyword map, page briefs, internal linking, content plan and launch checklist._

**Honesty note:** no keyword tool or Search Console data was available. Search volumes and difficulty are **unknown**, not estimated. Every row below is a hypothesis to validate with Google Search Console (after launch) and a keyword tool (e.g. Google Keyword Planner) before investing in content.

## Strategy
1. **Win specific, high-intent, India-marketplace queries** (long tail) where generic tool giants are less targeted. This is a hypothesis.
2. **Compete modestly on generic converter terms** with one strong tool page, not dozens of near-duplicate "X to Y" pages.
3. **Earn links and trust** with genuinely useful guides (photo guide, marketplace rules with sources).

## Keyword map
| Primary keyword | Secondary / long tail | Intent | URL | Title (live) | H1 (live) | Internal links | Gap | Confidence | Validation |
|---|---|---|---|---|---|---|---|---|---|
| product photos for Amazon Flipkart Meesho | white background product photo, marketplace image size | Transactional | `/` | Idoconverter: marketplace-ready product photos in minutes | Your product photos, marketplace-ready in minutes. | /product-photos, /tools/image-converter, /photo-guide | Testimonials (none yet; don't fake) | Medium | Unvalidated |
| product photo resizer Amazon | Amazon product image size India, Amazon main image white background | Transactional | `/product-photos` | Product photo resizer for Amazon, Flipkart & Meesho | Product photos | /#rules, /photo-guide | Per-marketplace explainer copy below the tool | Medium | Unvalidated |
| bulk image converter | JPG to WebP, PNG to JPG, WebP to JPG, image resizer, compress image | Transactional | `/tools/image-converter` | Bulk image converter: JPG, PNG and WebP | Bulk image converter | / , /product-photos | Very competitive; few links | Low–Medium | Unvalidated |
| how to take product photos with phone | white background product photography at home | Informational | `/photo-guide` | Product photos on a white background with a phone | Shoot product photos that pass first time | /product-photos | Example photos (original, not stock) | Medium | Unvalidated |
| Meesho image size / Flipkart image guidelines | Meesho product photo requirements | Informational | **Planned**: `/guides/meesho-image-requirements`, `/guides/flipkart-image-requirements` | — | — | /product-photos?preset=… | Needs official-source verification first | Medium | Blocked (rules unverified) |

**Rejected on purpose:** separate pages per format pair (`/jpg-to-webp` and so on). They'd target near-identical intent with the same tool, a doorway-page pattern. Revisit only if Search Console shows distinct demand and the page can carry unique, useful content.

## Page briefs (live pages)
- **`/`:** audience, sellers; intent, fix marketplace photos now. Must have the drop zone above the fold, a real before/after, sourced rules and FAQ. CTA: drop photos or try samples.
- **`/product-photos`:** the tool first, then add per-marketplace explanations (gap).
- **`/tools/image-converter`:** the tool first; a "which format" explainer; an honest FAQ (HEIC not supported, WebP on Safari).
- **`/photo-guide`:** a step-by-step setup, common problems, and a CTA to the tool.

## Internal linking
- **Header:** Product photos, Image converter, Marketplace rules, Photo guide.
- **Footer:** all public pages.
- **In content:** home → converter (how-it-works); rules → presets (`/product-photos?preset=…`); tool results → photo guide (failures) and early access; guide → tool.
- **Breadcrumbs** on all inner pages (with BreadcrumbList JSON-LD).

## Content plan (next, in order)
1. Meesho and Flipkart image requirement guides, **only after verifying the rules in the official panels**; cite them and show the date.
2. Amazon India main-image guide (the sourced rules, plus how to fix common rejections).
3. "JPG vs PNG vs WebP for online stores": an explainer linking to the converter.
4. A Hindi version of the photo guide (test demand first).

**Quality bar:** an original example, specific steps, accurate sources, dates, and no fluff or AI-generated filler.

## Launch checklist
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain, then rebuild; canonicals, sitemap and OG URLs correct
- [ ] Preferred host (www or not) chosen; the other redirects with 301 (Hostinger domain settings)
- [ ] HTTPS on; HTTP → HTTPS redirect
- [ ] Google Search Console: verify the domain, submit `/sitemap.xml`, inspect the 4 key URLs
- [ ] Bing Webmaster Tools (optional), import from Search Console
- [ ] Re-run `npm run test:e2e` (SEO checks) against production
- [ ] Rich Results Test on `/` and `/tools/image-converter` (expect valid markup; **no rich result is guaranteed**)

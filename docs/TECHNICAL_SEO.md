# Technical SEO

_Also covers structured data and crawler policy._

## Implemented and tested
| Item | Implementation | Test |
|---|---|---|
| Titles and descriptions | `pageMetadata()` in `lib/seo.ts`; template `%s \| Idoconverter`; titles ≤ 70, descriptions 70–170, all unique | e2e SEO |
| Canonical | Absolute URL on `NEXT_PUBLIC_SITE_URL`; root without a trailing slash | e2e |
| Open Graph / Twitter | Per page; `/og.png` 1200×630 (original artwork) | e2e |
| H1 | Exactly one per page | e2e |
| robots.txt | `app/robots.ts`: allow `/`, disallow `/api/`, sitemap link | e2e |
| Sitemap | `app/sitemap.ts` from `lib/routes.ts` with real last-modified dates | e2e (all routes listed, no `/api`) |
| 404 | Real 404 status + `noindex` | e2e |
| Rendering | All pages server-rendered HTML per request (crawlable without JS; per-request CSP nonce, ADR-13) | build output; e2e SEO |
| Performance | See TEST_RESULTS (lab) | Lab script |

**Remember:** `robots.txt` is not access control, and `noindex` doesn't protect content. The API protects itself.

## Structured data
| Page | Types | Notes |
|---|---|---|
| `/` | WebSite, Organization (name, url, logo) | No address, phone or social profiles: none exist yet |
| `/product-photos`, `/tools/image-converter`, `/tools/watermark` | WebApplication (+ `isAccessibleForFree`), BreadcrumbList | **No ratings, reviews or prices**, so these pages aren't eligible for software rich results; the markup is descriptive only |
| Inner pages | BreadcrumbList | |

**Not indexed on purpose:** `/brand-kit` (personal settings) and `/templates/[id]` (editors that share the gallery's intent). Both carry `noindex, follow` and are not in the sitemap; the gallery `/templates` is indexed.

FAQ markup is **not used**: FAQ rich results are limited to a narrow set of sites, and the visible FAQs work without it. Validate with Google's Rich Results Test after launch.

## Crawler policy (owner decision needed: ASSUMPTIONS Q10)
- **Current default:** all crawlers allowed on public pages. The site's goal is discovery, and the content is marketing and help pages, with no proprietary data.
- **Search engine crawlers** (Googlebot, Bingbot): allow.
- **AI search and retrieval crawlers** (used to answer questions with citations): allowing them may bring referrals; there's no guaranteed inclusion.
- **AI training crawlers:** blocking them is a values and business choice with little SEO effect.

To block a crawler, add a rule in `app/robots.ts` using the exact user-agent token from that vendor's **current** documentation (tokens change; don't copy lists from blogs). Compliance is voluntary for crawlers.

`llms.txt` is not implemented. It's an optional, emerging convention, not a substitute for sitemaps and good pages.

## Host and redirects (at deploy)
Choose `https://idoconverter.com` or `https://www.…`, set `NEXT_PUBLIC_SITE_URL` to it, and 301-redirect the other in Hostinger's domain settings. Query parameters (`?preset=`, `?samples=1`) are canonicalised to the clean URL by the canonical tag.

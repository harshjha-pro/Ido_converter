import type { Metadata } from "next";
import { SITE } from "@/lib/config";

/** Absolute URL on the canonical host. */
export function absoluteUrl(path = "/"): string {
  // The site root is written without a trailing slash, matching what Next.js renders in <link rel="canonical">.
  return path === "/" ? SITE.url : new URL(path, SITE.url).toString();
}

interface PageSeo { title: string; description: string; path: string; noindex?: boolean }

/** One place for titles, descriptions, canonicals and sharing tags, so every page is consistent. */
export function pageMetadata({ title, description, path, noindex }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website", url, title, description, siteName: SITE.name, locale: "en_IN",
      images: [{ url: absoluteUrl("/og.png"), width: 1200, height: 630, alt: "Idoconverter: product photos on a pure white square with measurement marks" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/og.png")] },
  };
}

export interface Crumb { name: string; path: string }

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  };
}

export function siteJsonLd() {
  return [
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: absoluteUrl("/") },
    { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: absoluteUrl("/"), logo: absoluteUrl("/icon.svg") },
  ];
}

/** Describes a free browser tool. Contains only facts true of the page: no ratings, reviews or invented prices. */
export function webAppJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name, description, url: absoluteUrl(path),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (modern web browser)",
    browserRequirements: "Requires JavaScript and a modern browser",
    isAccessibleForFree: true,
  };
}

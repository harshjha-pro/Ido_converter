import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Crawl policy (see docs/TECHNICAL_SEO.md). All crawlers may read public pages; API routes are excluded.
 * robots.txt is advisory, not access control: the API protects itself with origin checks and rate limits.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

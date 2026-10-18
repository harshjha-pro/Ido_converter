import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map(r => ({ url: absoluteUrl(r.path), lastModified: new Date(`${r.updated}T00:00:00Z`), priority: r.priority }));
}

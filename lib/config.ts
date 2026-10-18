export const SITE = {
  name: "Idoconverter",
  /** Canonical origin for links, sitemap and structured data. Set NEXT_PUBLIC_SITE_URL before building. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://idoconverter.com").replace(/\/$/, ""),
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
};

export const LIMITS = {
  maxFiles: 100,
  maxBytes: 30 * 1024 * 1024,
  maxMegapixels: 40,
  accept: ["image/jpeg", "image/png", "image/webp"],
};

export function whatsappLink(text: string): string | null {
  if (!SITE.whatsappNumber) return null;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

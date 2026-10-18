/** Every live tool, in display order. Single source for the tools directory, footer and related links. */
export interface Tool { name: string; path: string; summary: string; bestFor: string }

export const TOOLS: Tool[] = [
  {
    name: "Product photos", path: "/product-photos",
    summary: "Pure white background, centred, sized, compressed and renamed for Amazon India, Flipkart or Meesho, with a Pass/Check/Fail report.",
    bestFor: "Marketplace listings",
  },
  {
    name: "Image converter", path: "/tools/image-converter",
    summary: "JPG, PNG and WebP in any direction. Crop or pad to a shape, resize, compress, rotate, flip and rename a whole batch.",
    bestFor: "Websites, shops and quick fixes",
  },
  {
    name: "Watermark", path: "/tools/watermark",
    summary: "Your shop name or logo on every photo, at one position or repeated across the image, with the opacity you choose.",
    bestFor: "Social posts and buyer previews",
  },
  {
    name: "Templates", path: "/templates",
    summary: "Editable designs for sale posts, new arrivals, festive offers, tips and YouTube thumbnails. Change the text, colours and photo, then download.",
    bestFor: "Instagram, WhatsApp status and YouTube",
  },
];

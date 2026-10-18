/**
 * Editable design templates. A template is data: elements placed in fractions of the canvas
 * and coloured from a four-colour palette, so text, colours, photos and the logo stay editable.
 */
export type FormatKey = "post" | "portrait" | "story" | "thumbnail";
export type PaletteKey = "bg" | "ink" | "accent" | "soft";
export type Palette = Record<PaletteKey, string>;

export const FORMATS: Record<FormatKey, { label: string; w: number; h: number; use: string }> = {
  post: { label: "Square post", w: 1080, h: 1080, use: "Instagram or Facebook feed" },
  portrait: { label: "Portrait post", w: 1080, h: 1350, use: "Instagram feed (4:5)" },
  story: { label: "Story", w: 1080, h: 1920, use: "Instagram or WhatsApp status (9:16)" },
  thumbnail: { label: "YouTube thumbnail", w: 1280, h: 720, use: "YouTube video (16:9)" },
};

export const PALETTE_LABEL: Record<PaletteKey, string> = { bg: "Background", ink: "Text", accent: "Accent", soft: "Panel" };

interface Box { x: number; y: number; w: number; h: number }

export type El =
  | (Box & { type: "rect"; fill: PaletteKey; radius?: number })
  | (Box & { type: "image"; id: string; label: string; fit: "cover" | "contain"; radius?: number })
  | (Box & { type: "logo" })
  | {
      type: "text"; id: string; label: string; text: string;
      x: number; y: number; w: number;
      /** Font size as a share of the canvas width. */
      size: number; weight: 400 | 600 | 700; color: PaletteKey;
      align: "left" | "center" | "right"; maxLines: number;
      /** Filled from the brand kit's shop name when the user asks. */
      shop?: boolean;
    };

export type Category = "sale" | "launch" | "festival" | "tips" | "quote" | "video";
export const CATEGORY_LABEL: Record<Category, string> = {
  sale: "Sale and offers", launch: "New products", festival: "Festivals", tips: "Tips and education", quote: "Quotes", video: "YouTube",
};

export interface Template {
  id: string;
  name: string;
  category: Category;
  format: FormatKey;
  palette: Palette;
  elements: El[];
  /** Sample photo shown until the user adds their own (our own original sample images). */
  sample?: string;
}

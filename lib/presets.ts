export type PresetKey = "amazon" | "flipkart" | "meesho" | "custom";

export interface Preset {
  key: PresetKey;
  label: string;
  sub: string;
  folder: string;
  size: number;
  fill: number; // percent
  maxKB: number;
  minSide: number;
  pattern: string;
  clean: boolean;
  tolerance: number;
  /** "sourced" = from the marketplace's own staff/help content; "unverified" = third-party guides only. */
  verification: "sourced" | "unverified" | "none";
  source: string;
  checkedOn: string;
  rules: string[];
}

/**
 * Rules must be re-confirmed in each seller panel before relying on them.
 * Update `checkedOn` whenever a rule is re-verified.
 */
export const PRESETS: Record<PresetKey, Preset> = {
  amazon: {
    key: "amazon",
    label: "Amazon India",
    sub: "Main image",
    folder: "amazon-in-main",
    size: 1600,
    fill: 85,
    maxKB: 10000,
    minSide: 1000,
    pattern: "{name}.MAIN",
    clean: true,
    tolerance: 240,
    verification: "sourced",
    source: "Amazon staff posts in Seller Central forums. Confirm in Seller Central help.",
    checkedOn: "17 Oct 2026",
    rules: [
      "Pure white background (255, 255, 255)",
      "Product fills about 85% of the frame",
      "Longest side at least 1,000 px; 1,600 px or more for zoom",
      "No text, logos or watermarks (we can’t check this)",
      "Files named ASIN.MAIN.jpg for bulk upload",
    ],
  },
  flipkart: {
    key: "flipkart",
    label: "Flipkart",
    sub: "Primary image",
    folder: "flipkart-primary",
    size: 1500,
    fill: 85,
    maxKB: 5000,
    minSide: 1000,
    pattern: "{name}",
    clean: true,
    tolerance: 240,
    verification: "unverified",
    source: "Third-party seller guides. Confirm in Flipkart Seller Hub.",
    checkedOn: "17 Oct 2026",
    rules: [
      "White background",
      "Product fills 80–85% of the frame (guides differ)",
      "At least 1,000 × 1,000 px",
      "Product in focus (we can’t check this)",
    ],
  },
  meesho: {
    key: "meesho",
    label: "Meesho",
    sub: "First image",
    folder: "meesho-first",
    size: 1200,
    fill: 85,
    maxKB: 3000,
    minSide: 800,
    pattern: "{name}",
    clean: true,
    tolerance: 240,
    verification: "unverified",
    source: "Third-party guides. Confirm in the Meesho Supplier Panel.",
    checkedOn: "17 Oct 2026",
    rules: [
      "Plain, uncluttered background (we output white)",
      "No text or watermarks (we can’t check this)",
      "Square output at the size you choose",
    ],
  },
  custom: {
    key: "custom",
    label: "Custom",
    sub: "Your own settings",
    folder: "custom",
    size: 1500,
    fill: 85,
    maxKB: 2000,
    minSide: 500,
    pattern: "{name}",
    clean: false,
    tolerance: 240,
    verification: "none",
    source: "No marketplace rules applied.",
    checkedOn: "",
    rules: [],
  },
};

export const MARKETPLACES: Preset[] = [PRESETS.amazon, PRESETS.flipkart, PRESETS.meesho];

export function isPresetKey(v: string | null | undefined): v is PresetKey {
  return v === "amazon" || v === "flipkart" || v === "meesho" || v === "custom";
}

/**
 * The brand kit: shop name, logo and colours, kept in this browser only (lib/storage.ts).
 * The logo is stored as a small PNG data URL so it survives reloads without any upload.
 */
import { readJson, removeKey, writeJson } from "./storage";

export interface BrandKit { name: string; colors: string[]; logo: string | null }

export const EMPTY_KIT: BrandKit = { name: "", colors: [], logo: null };
export const KIT_KEY = "ido.brandkit.v1";
export const MAX_COLORS = 4;
export const LOGO_EDGE = 512;
const MAX_LOGO_CHARS = 1_000_000; // ~730 KB of PNG; a 512 px logo is far smaller

/** Accepts a stored kit only in the exact shape we write. Pure, so it is unit-tested. */
export function validateKit(v: unknown): BrandKit | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const { name, colors, logo } = v as Record<string, unknown>;
  if (typeof name !== "string" || name.length > 60) return null;
  if (!Array.isArray(colors) || colors.length > MAX_COLORS || !colors.every(c => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c))) return null;
  if (logo !== null && (typeof logo !== "string" || !logo.startsWith("data:image/png;base64,") || logo.length > MAX_LOGO_CHARS)) return null;
  return { name, colors: colors as string[], logo: logo as string | null };
}

export const isEmptyKit = (k: BrandKit) => !k.name.trim() && !k.colors.length && !k.logo;

export function loadKit(): BrandKit { return validateKit(readJson(KIT_KEY)) ?? EMPTY_KIT; }
export function saveKit(k: BrandKit): boolean { return writeJson(KIT_KEY, k); }
export function clearKit() { removeKey(KIT_KEY); }

/** Scales a logo down to LOGO_EDGE px on its longest side and returns it as a PNG data URL (keeps transparency). */
export async function logoToDataUrl(file: Blob): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, LOGO_EDGE / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * scale));
  c.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/png");
}

/** Turns the stored logo back into a File. Decoded by hand: the CSP doesn't let fetch() read data: URLs. */
export function dataUrlToFile(dataUrl: string, name = "brand-logo.png"): File {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: "image/png" });
}

/**
 * Input schemas shared by the browser (instant feedback) and the server (authoritative check).
 * Never trust the browser's result: every API route re-validates with these schemas.
 */
import { z } from "zod";

// Zod otherwise probes for eval with Function(""), which the page CSP blocks and reports as a violation.
z.config({ jitless: true });

export const CONSENT_VERSION = "2026-10-18";

export const ROLES = ["seller", "cataloguer", "agency", "other"] as const;
export const VOLUMES = ["under_50", "50_200", "200_1000", "over_1000"] as const;
export const SOURCES = ["home", "tool", "guide"] as const;
export const PRESET_KEYS = ["amazon", "flipkart", "meesho", "custom"] as const;
export const DEVICE_CLASSES = ["mobile", "tablet", "desktop"] as const;

export type ContactType = "email" | "phone";
export interface NormalizedContact { type: ContactType; value: string }

/** Email → lower-case. Indian mobile (10 digits starting 6–9, with or without +91/91/0) → +91XXXXXXXXXX. Other numbers must be + and 8–15 digits. */
export function normalizeContact(raw: string): NormalizedContact | null {
  const v = raw.trim();
  if (v.includes("@")) {
    const email = v.toLowerCase();
    return z.email().max(254).safeParse(email).success ? { type: "email", value: email } : null;
  }
  const digits = v.replace(/[\s().-]/g, "");
  let m = digits.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  if (m) return { type: "phone", value: `+91${m[1]}` };
  m = digits.match(/^\+([1-9]\d{7,14})$/);
  if (m) return { type: "phone", value: `+${m[1]}` };
  return null;
}

export const earlyAccessSchema = z.object({
  contact: z.string().trim().min(1, "Enter your email or WhatsApp number.").max(254, "That’s too long.")
    .refine(v => normalizeContact(v) !== null, "Enter a valid email or mobile number."),
  role: z.enum(ROLES, { error: "Choose what describes you best." }),
  marketplaces: z.array(z.enum(["amazon", "flipkart", "meesho", "other"])).min(1, "Choose at least one.").max(4),
  monthlyPhotos: z.enum(VOLUMES, { error: "Choose roughly how many photos." }),
  note: z.string().trim().max(500, "Keep it under 500 characters.").optional().default(""),
  consent: z.literal(true, { error: "Please agree so we can contact you." }),
  consentVersion: z.literal(CONSENT_VERSION),
  source: z.enum(SOURCES),
  website: z.string().max(200).optional().default(""), // honeypot: humans never see or fill this
}).strict();

export type EarlyAccessInput = z.input<typeof earlyAccessSchema>;
export type EarlyAccessData = z.output<typeof earlyAccessSchema>;

const count = z.number().int().min(0).max(100);
export const batchEventSchema = z.object({
  presetKey: z.enum(PRESET_KEYS),
  photoCount: z.number().int().min(1).max(100),
  processedCount: count,
  passCount: count,
  checkCount: count,
  failCount: count,
  durationMs: z.number().int().min(0).max(3_600_000),
  outputSize: z.number().int().min(500).max(5000),
  deviceClass: z.enum(DEVICE_CLASSES),
  usedWorker: z.boolean(),
  cancelled: z.boolean(),
  usedSamples: z.boolean(),
}).strict()
  .refine(d => d.processedCount <= d.photoCount, { message: "processedCount exceeds photoCount", path: ["processedCount"] })
  .refine(d => d.passCount + d.checkCount + d.failCount === d.processedCount, { message: "Counts don’t add up", path: ["processedCount"] });

export type BatchEventInput = z.infer<typeof batchEventSchema>;

/** Flatten Zod issues into { field: message } for forms and API responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

import { z } from "zod";

/**
 * Server-only configuration, validated once. Missing database settings are allowed:
 * the site still works and the data endpoints answer 503 with a clear code.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().regex(/^mysql:\/\//, "DATABASE_URL must start with mysql://").optional(),
  DB_POOL_SIZE: z.coerce.number().int().min(1).max(10).default(3),
  IP_HASH_SECRET: z.string().min(32, "IP_HASH_SECRET must be at least 32 characters").optional(),
  APP_ORIGIN: z.string().url().optional(),
  CLIENT_IP_HEADER: z.string().default("x-forwarded-for"),
});

export type Env = z.infer<typeof schema>;
let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const names = parsed.error.issues.map(i => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment: ${names}`);
  }
  cached = parsed.data;
  return cached;
}

/** For tests only. */
export function resetEnvCache() { cached = null; }

export function allowedOrigins(): string[] {
  const e = env();
  const list = e.APP_ORIGIN ? [new URL(e.APP_ORIGIN).origin] : [];
  if (e.NODE_ENV !== "production") list.push("http://localhost:3000", "http://localhost:3100", "http://127.0.0.1:3000");
  return list;
}

import { createHmac } from "node:crypto";
import type { Pool, RowDataPacket } from "mysql2/promise";
import { env } from "./env";

/**
 * Fixed-window rate limiting stored in MySQL (no Redis on shared hosting).
 * Client IPs are never stored: only an HMAC-SHA256 with a server secret, so the
 * value can't be reversed or matched against other sites' data.
 */
export interface Limit { bucket: string; max: number; windowSeconds: number }

export const LIMITS = {
  earlyAccess: { bucket: "early_access", max: 5, windowSeconds: 3600 },
  batchEvent: { bucket: "batch_event", max: 60, windowSeconds: 3600 },
} satisfies Record<string, Limit>;

export function clientKey(req: Request): string {
  const header = env().CLIENT_IP_HEADER.toLowerCase();
  const raw = req.headers.get(header) ?? "";
  const ip = raw.split(",")[0]?.trim() || "unknown";
  return ip;
}

export function hashKey(key: string): string {
  const secret = env().IP_HASH_SECRET;
  if (!secret) throw new Error("IP_HASH_SECRET is not set");
  return createHmac("sha256", secret).update(key).digest("hex");
}

export function windowStart(now: Date, windowSeconds: number): Date {
  const ms = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / ms) * ms);
}

export interface LimitResult { allowed: boolean; hits: number; retryAfter: number }

export async function consume(pool: Pool, limit: Limit, keyHash: string, now = new Date()): Promise<LimitResult> {
  const start = windowStart(now, limit.windowSeconds);
  await pool.execute(
    "INSERT INTO rate_limits (bucket, key_hash, window_start, hits) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE hits = hits + 1",
    [limit.bucket, keyHash, start],
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT hits FROM rate_limits WHERE bucket = ? AND key_hash = ? AND window_start = ?",
    [limit.bucket, keyHash, start],
  );
  const hits = Number(rows[0]?.hits ?? 1);
  const retryAfter = Math.max(1, Math.ceil((start.getTime() + limit.windowSeconds * 1000 - now.getTime()) / 1000));
  // Opportunistic cleanup: no cron needed. Removes windows older than a day.
  if (Math.random() < 0.02) {
    await pool.execute("DELETE FROM rate_limits WHERE window_start < ? LIMIT 1000", [new Date(now.getTime() - 86_400_000)]);
  }
  return { allowed: hits <= limit.max, hits, retryAfter };
}

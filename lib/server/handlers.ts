/**
 * Route logic, kept separate from Next.js route files so it can be tested directly
 * with standard Request objects.
 */
import { randomUUID } from "node:crypto";
import { batchEventSchema, earlyAccessSchema, fieldErrors } from "@/lib/validation";
import { DatabaseNotConfiguredError, getPool } from "./db/client";
import { env } from "./env";
import { fail, ok, readJson } from "./http";
import { log } from "./log";
import { clientKey, consume, hashKey, LIMITS, type Limit } from "./rateLimit";
import { submitEarlyAccess } from "./services/earlyAccess";
import { recordBatchEvent } from "./services/batchEvents";

function serviceReady(requestId: string): Response | null {
  const e = env();
  if (!e.DATABASE_URL || !e.IP_HASH_SECRET) {
    return fail(503, "service_unavailable", "This feature isn’t available right now.", { requestId });
  }
  return null;
}

function dbFailure(route: string, requestId: string, err: unknown): Response {
  if (err instanceof DatabaseNotConfiguredError) return fail(503, "service_unavailable", "This feature isn’t available right now.", { requestId });
  const code = (err as { code?: string })?.code ?? "unknown";
  log("error", "db_error", { route, requestId, code });
  return fail(503, "database_unavailable", "We couldn’t save that just now. Please try again in a minute.", { requestId });
}

/**
 * If the client IP can't be determined (proxy header missing), every visitor would share one bucket.
 * A shared bucket at the normal limit would lock out real users, so it gets 20× the limit and a warning.
 */
export const UNKNOWN_CLIENT_MULTIPLIER = 20;

async function limited(req: Request, limit: Limit, requestId: string): Promise<Response | null> {
  const key = clientKey(req);
  const effective = key === "unknown" ? { ...limit, max: limit.max * UNKNOWN_CLIENT_MULTIPLIER } : limit;
  if (key === "unknown") log("warn", "client_ip_unknown", { bucket: limit.bucket, header: env().CLIENT_IP_HEADER, requestId });
  const r = await consume(getPool(), effective, hashKey(key));
  if (r.allowed) return null;
  log("warn", "rate_limited", { bucket: limit.bucket, requestId });
  return fail(429, "rate_limited", "Too many requests. Please try again later.", { requestId, headers: { "Retry-After": String(r.retryAfter) } });
}

export async function handleEarlyAccess(req: Request): Promise<Response> {
  const requestId = randomUUID();
  const notReady = serviceReady(requestId);
  if (notReady) return notReady;
  const parsed = await readJson(req, requestId);
  if ("response" in parsed) return parsed.response;
  const v = earlyAccessSchema.safeParse(parsed.body);
  if (!v.success) return fail(422, "validation_failed", "Please check the highlighted fields.", { fields: fieldErrors(v.error), requestId });
  try {
    const blocked = await limited(req, LIMITS.earlyAccess, requestId);
    if (blocked) return blocked;
    const outcome = await submitEarlyAccess(v.data);
    log("info", "early_access", { outcome, source: v.data.source, requestId });
    if (outcome === "ignored") return ok({ status: "received" }, 202);
    return ok({ status: outcome }, outcome === "created" ? 201 : 200);
  } catch (err) {
    return dbFailure("early_access", requestId, err);
  }
}

export async function handleBatchEvent(req: Request): Promise<Response> {
  const requestId = randomUUID();
  const notReady = serviceReady(requestId);
  if (notReady) return notReady;
  const parsed = await readJson(req, requestId);
  if ("response" in parsed) return parsed.response;
  const v = batchEventSchema.safeParse(parsed.body);
  if (!v.success) return fail(422, "validation_failed", "Invalid batch summary.", { fields: fieldErrors(v.error), requestId });
  try {
    const blocked = await limited(req, LIMITS.batchEvent, requestId);
    if (blocked) return blocked;
    await recordBatchEvent(v.data);
    return ok({ status: "recorded" }, 201);
  } catch (err) {
    return dbFailure("batch_event", requestId, err);
  }
}

export async function handleHealth(): Promise<Response> {
  const requestId = randomUUID();
  if (!env().DATABASE_URL) return fail(503, "service_unavailable", "Database not configured.", { requestId });
  try {
    const t0 = Date.now();
    await getPool().query("SELECT 1");
    return ok({ status: "ok", database: "up", latencyMs: Date.now() - t0 });
  } catch (err) {
    log("error", "health_db_down", { requestId, code: (err as { code?: string })?.code ?? "unknown" });
    return fail(503, "database_unavailable", "Database unreachable.", { requestId });
  }
}

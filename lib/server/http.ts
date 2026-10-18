import { randomUUID } from "node:crypto";
import { allowedOrigins } from "./env";

export type ErrorCode =
  | "bad_request" | "invalid_json" | "unsupported_media_type" | "payload_too_large" | "forbidden_origin"
  | "validation_failed" | "rate_limited" | "service_unavailable" | "database_unavailable" | "internal_error";

export interface ApiSuccess<T> { ok: true; data: T }
export interface ApiError { ok: false; error: { code: ErrorCode; message: string; fields?: Record<string, string> }; requestId: string }

const BASE_HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };

export function ok<T>(data: T, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({ ok: true, data } satisfies ApiSuccess<T>), { status, headers: { ...BASE_HEADERS, ...headers } });
}

export function fail(status: number, code: ErrorCode, message: string, opts: { fields?: Record<string, string>; headers?: Record<string, string>; requestId?: string } = {}) {
  const body: ApiError = { ok: false, error: { code, message, ...(opts.fields ? { fields: opts.fields } : {}) }, requestId: opts.requestId ?? randomUUID() };
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...(opts.headers ?? {}) } });
}

export const MAX_BODY_BYTES = 8 * 1024;

/**
 * Common checks for public JSON POST endpoints:
 * same-site Origin (blocks cross-site form abuse), JSON content type, small bodies, valid JSON.
 */
export async function readJson(req: Request, requestId: string): Promise<{ body: unknown } | { response: Response }> {
  const origin = req.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) {
    return { response: fail(403, "forbidden_origin", "Requests must come from the Idoconverter website.", { requestId }) };
  }
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    return { response: fail(415, "unsupported_media_type", "Send JSON with Content-Type: application/json.", { requestId }) };
  }
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return { response: fail(413, "payload_too_large", "Request body is too large.", { requestId }) };
  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return { response: fail(413, "payload_too_large", "Request body is too large.", { requestId }) };
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { response: fail(400, "invalid_json", "Request body isn’t valid JSON.", { requestId }) };
  }
}

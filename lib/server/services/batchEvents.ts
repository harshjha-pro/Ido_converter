import { getDb } from "@/lib/server/db/client";
import { batchEvents } from "@/lib/server/db/schema";
import type { BatchEventInput } from "@/lib/validation";

/** Store one anonymous batch summary: counts and settings only, no files, names or identifiers. */
export async function recordBatchEvent(e: BatchEventInput, now = new Date()) {
  await getDb().insert(batchEvents).values({ ...e, createdAt: now });
}

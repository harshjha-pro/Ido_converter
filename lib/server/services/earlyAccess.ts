import { sql } from "drizzle-orm";
import type { ResultSetHeader } from "mysql2";
import { getDb } from "@/lib/server/db/client";
import { earlyAccessLeads } from "@/lib/server/db/schema";
import { normalizeContact, type EarlyAccessData } from "@/lib/validation";

export type SubmitOutcome = "created" | "updated" | "ignored";

/**
 * Create or refresh an early-access lead. The same contact submitting again updates
 * their answers instead of creating duplicates (idempotent on contact).
 */
export async function submitEarlyAccess(data: EarlyAccessData, now = new Date()): Promise<SubmitOutcome> {
  if (data.website) return "ignored"; // honeypot filled: almost certainly a bot
  const contact = normalizeContact(data.contact);
  if (!contact) throw new Error("contact failed normalisation after validation");
  const m = new Set(data.marketplaces);
  const values = {
    role: data.role,
    sellsAmazon: m.has("amazon"), sellsFlipkart: m.has("flipkart"), sellsMeesho: m.has("meesho"), sellsOther: m.has("other"),
    monthlyPhotos: data.monthlyPhotos,
    note: data.note ? data.note : null,
    source: data.source,
    consentVersion: data.consentVersion,
    consentAt: now,
  };
  const [res] = (await getDb().insert(earlyAccessLeads).values({
    contactType: contact.type, contactValue: contact.value, ...values, createdAt: now, updatedAt: now,
  }).onDuplicateKeyUpdate({
    set: { ...values, updatedAt: now, submissions: sql`LEAST(${earlyAccessLeads.submissions} + 1, 65535)` },
  })) as unknown as [ResultSetHeader];
  // MySQL reports 1 for an insert and 2 for an update of an existing row.
  return res.affectedRows === 1 ? "created" : "updated";
}

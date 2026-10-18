/**
 * Drizzle table definitions used for typed queries.
 * The SQL files in database/migrations are the source of truth for DDL;
 * tests/integration/schema-consistency.test.ts fails if the two drift apart.
 */
import { bigint, boolean, char, datetime, index, int, mysqlEnum, mysqlTable, primaryKey, smallint, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const earlyAccessLeads = mysqlTable("early_access_leads", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  contactType: mysqlEnum("contact_type", ["email", "phone"]).notNull(),
  contactValue: varchar("contact_value", { length: 254 }).notNull(),
  role: mysqlEnum("role", ["seller", "cataloguer", "agency", "other"]).notNull(),
  sellsAmazon: boolean("sells_amazon").notNull().default(false),
  sellsFlipkart: boolean("sells_flipkart").notNull().default(false),
  sellsMeesho: boolean("sells_meesho").notNull().default(false),
  sellsOther: boolean("sells_other").notNull().default(false),
  monthlyPhotos: mysqlEnum("monthly_photos", ["under_50", "50_200", "200_1000", "over_1000"]).notNull(),
  note: varchar("note", { length: 500 }),
  source: mysqlEnum("source", ["home", "tool", "guide"]).notNull(),
  consentVersion: varchar("consent_version", { length: 16 }).notNull(),
  consentAt: datetime("consent_at", { mode: "date", fsp: 3 }).notNull(),
  submissions: smallint("submissions", { unsigned: true }).notNull().default(1),
  createdAt: datetime("created_at", { mode: "date", fsp: 3 }).notNull(),
  updatedAt: datetime("updated_at", { mode: "date", fsp: 3 }).notNull(),
}, t => [
  uniqueIndex("uq_leads_contact").on(t.contactType, t.contactValue),
  index("ix_leads_created").on(t.createdAt),
]);

export const batchEvents = mysqlTable("batch_events", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  createdAt: datetime("created_at", { mode: "date", fsp: 3 }).notNull(),
  presetKey: mysqlEnum("preset_key", ["amazon", "flipkart", "meesho", "custom"]).notNull(),
  photoCount: smallint("photo_count", { unsigned: true }).notNull(),
  processedCount: smallint("processed_count", { unsigned: true }).notNull(),
  passCount: smallint("pass_count", { unsigned: true }).notNull(),
  checkCount: smallint("check_count", { unsigned: true }).notNull(),
  failCount: smallint("fail_count", { unsigned: true }).notNull(),
  durationMs: int("duration_ms", { unsigned: true }).notNull(),
  outputSize: smallint("output_size", { unsigned: true }).notNull(),
  deviceClass: mysqlEnum("device_class", ["mobile", "tablet", "desktop"]).notNull(),
  usedWorker: boolean("used_worker").notNull(),
  cancelled: boolean("cancelled").notNull(),
  usedSamples: boolean("used_samples").notNull().default(false),
}, t => [
  index("ix_batch_created").on(t.createdAt),
  index("ix_batch_preset_created").on(t.presetKey, t.createdAt),
]);

export const rateLimits = mysqlTable("rate_limits", {
  bucket: varchar("bucket", { length: 32 }).notNull(),
  keyHash: char("key_hash", { length: 64 }).notNull(),
  windowStart: datetime("window_start", { mode: "date" }).notNull(),
  hits: int("hits", { unsigned: true }).notNull().default(1),
}, t => [
  primaryKey({ columns: [t.bucket, t.keyHash, t.windowStart] }),
  index("ix_rate_window").on(t.windowStart),
]);

/** Expected columns per table, compared with information_schema by the consistency test. */
export const SCHEMA_TABLES = { early_access_leads: earlyAccessLeads, batch_events: batchEvents, rate_limits: rateLimits } as const;

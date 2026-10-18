import mysql, { type Pool } from "mysql2/promise";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import { env } from "@/lib/server/env";
import * as schema from "./schema";

/**
 * One small connection pool per server process. Shared hosting caps connections per
 * database user, so the pool defaults to 3 and never queues forever.
 */
export class DatabaseNotConfiguredError extends Error {
  constructor() { super("DATABASE_URL is not set"); this.name = "DatabaseNotConfiguredError"; }
}

type Db = MySql2Database<typeof schema>;
const g = globalThis as unknown as { __idoPool?: Pool; __idoDb?: Db; __idoPoolUrl?: string };

export function getPool(): Pool {
  const { DATABASE_URL, DB_POOL_SIZE } = env();
  if (!DATABASE_URL) throw new DatabaseNotConfiguredError();
  if (g.__idoPool && g.__idoPoolUrl === DATABASE_URL) return g.__idoPool;
  g.__idoPool = mysql.createPool({
    uri: DATABASE_URL,
    connectionLimit: DB_POOL_SIZE,
    queueLimit: 50,
    waitForConnections: true,
    connectTimeout: 5_000,
    enableKeepAlive: true,
    timezone: "Z",            // all DATETIME values are UTC
    dateStrings: false,
    supportBigNumbers: true,
    multipleStatements: false, // never for app queries
    charset: "utf8mb4_unicode_ci",
  });
  g.__idoPoolUrl = DATABASE_URL;
  g.__idoDb = undefined;
  return g.__idoPool;
}

export function getDb(): Db {
  if (g.__idoDb && g.__idoPoolUrl === env().DATABASE_URL) return g.__idoDb;
  g.__idoDb = drizzle(getPool(), { schema, mode: "default" });
  return g.__idoDb;
}

/** For tests and graceful shutdown. */
export async function closeDb() {
  const p = g.__idoPool;
  g.__idoPool = undefined; g.__idoDb = undefined; g.__idoPoolUrl = undefined;
  if (p) await p.end();
}

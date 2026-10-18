#!/usr/bin/env node
// Loads fake development data. Refuses unless the database name ends in _dev or _test.
import fs from "node:fs";
import { connect, dbName, loadEnvFile } from "./_db.mjs";

loadEnvFile();
const name = dbName();
if (!/_(dev|test)$/.test(name)) {
  console.error(`Refusing to seed "${name}": database name must end in _dev or _test.`);
  process.exit(2);
}
const conn = await connect({ multipleStatements: true });
try {
  await conn.query(fs.readFileSync("database/seeds/development_seed.sql", "utf8"));
  console.log(`Seeded ${name}.`);
} finally {
  await conn.end();
}

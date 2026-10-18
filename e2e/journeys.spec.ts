import { expect, test } from "@playwright/test";
import mysql from "mysql2/promise";

const DB = process.env.E2E_DATABASE_URL;

async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const c = await mysql.createConnection({ uri: DB!, timezone: "Z" });
  try { return (await c.query(sql, params))[0] as T[]; } finally { await c.end(); }
}

test("health endpoint reports the database", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(DB ? 200 : 503);
  expect(res.headers()["cache-control"]).toBe("no-store");
});

test("seller signs up for early access from the homepage", async ({ page }, info) => {
  test.skip(!DB, "needs E2E_DATABASE_URL");
  const email = `e2e-${info.project.name}-${Date.now()}@example.com`;
  await query("DELETE FROM rate_limits WHERE bucket = 'early_access'");
  await page.goto("/#early-access");
  await page.getByRole("button", { name: "Join early access" }).click();
  await expect(page.getByText("Enter your email or WhatsApp number.")).toBeVisible();
  await page.getByLabel("Email or WhatsApp number").fill(email);
  await page.getByLabel("I do listings for sellers").check();
  await page.getByLabel("Flipkart").check();
  await page.getByLabel("Over 1,000").check();
  await page.getByLabel(/may contact me/).check();
  await page.getByRole("button", { name: "Join early access" }).click();
  await expect(page.getByText("You’re on the list.")).toBeVisible();
  const rows = await query<{ role: string; sells_flipkart: number; source: string }>("SELECT role, sells_flipkart, source FROM early_access_leads WHERE contact_value = ?", [email]);
  expect(rows).toEqual([{ role: "cataloguer", sells_flipkart: 1, source: "home" }]);
});

test("processing sample photos records one anonymous batch summary", async ({ page }) => {
  test.skip(!DB, "needs E2E_DATABASE_URL");
  const before = (await query<{ n: number }>("SELECT COUNT(*) AS n FROM batch_events WHERE used_samples = 1"))[0].n;
  await page.goto("/product-photos?samples=1");
  await expect(page.getByRole("status").filter({ hasText: "4 photos ready to process" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Process 4 photos" }).last().click();
  await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 60_000 });
  await expect.poll(async () => (await query<{ n: number }>("SELECT COUNT(*) AS n FROM batch_events WHERE used_samples = 1"))[0].n, { timeout: 10_000 }).toBe(Number(before) + 1);
  const [last] = await query<Record<string, number | string>>("SELECT photo_count, processed_count, pass_count, check_count, fail_count, preset_key FROM batch_events ORDER BY id DESC LIMIT 1");
  expect(last).toMatchObject({ photo_count: 4, processed_count: 4, pass_count: 2, check_count: 1, fail_count: 1, preset_key: "amazon" });
});

test("the tool keeps working when the API is unavailable", async ({ page }) => {
  await page.route("**/api/events/batch", route => route.fulfill({ status: 503, body: "{}" }));
  await page.goto("/product-photos?samples=1");
  await expect(page.getByRole("status").filter({ hasText: "4 photos ready to process" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Process 4 photos" }).last().click();
  await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 60_000 });
});

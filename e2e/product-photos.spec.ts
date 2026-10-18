import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { inspectImage, isJpeg, readZip } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/events/batch", route => route.fulfill({ status: 204, body: "" }));
  await page.goto("/product-photos?samples=1");
  await expect(page.getByRole("status").filter({ hasText: "4 photos ready to process" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Process 4 photos" }).last().click();
  await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 60_000 });
});

test("one processed photo can be downloaded on its own, at the preset size with a white corner", async ({ page }) => {
  await page.getByRole("button", { name: /^teal-mug\.jpg: / }).click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download teal-mug.MAIN.jpg" }).click()]);
  const buf = fs.readFileSync(await download.path());
  expect(isJpeg(buf)).toBe(true);
  const px = await inspectImage(page, buf, 2, 2);
  expect(px).toMatchObject({ w: 1600, h: 1600 });
  expect(px.rgba).toEqual([255, 255, 255, 255]);
});

test("removing a photo after processing takes it out of the ZIP and the report", async ({ page }) => {
  const close = page.getByRole("button", { name: "Close", exact: true });
  if (await close.isVisible()) await close.click();
  await page.getByRole("button", { name: "Remove teal-mug.jpg" }).click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).last().click()]);
  const zip = readZip(await download.path());
  const names = [...zip.keys()];
  expect(names.some(n => n.includes("teal-mug"))).toBe(false);
  expect(names.some(n => n.endsWith("report.csv"))).toBe(true);
  const csv = zip.get(names.find(n => n.endsWith("report.csv"))!)!.toString("utf8");
  expect(csv).not.toContain("teal-mug");
  expect(csv.trim().split("\r\n")).toHaveLength(4); // header + 3 photos
});

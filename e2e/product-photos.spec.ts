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

test.describe("several marketplaces in one run", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("button", { name: "Start over" }).last().click();
  });

  test("one ZIP holds a folder and a report per marketplace, each at its own size", async ({ page }) => {
    await page.goto("/product-photos?samples=1");
    await expect(page.getByRole("status").filter({ hasText: "4 photos ready to process" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("checkbox", { name: /^Flipkart/ }).check();
    await page.getByRole("checkbox", { name: /^Meesho/ }).check();
    await page.getByRole("button", { name: "Process 4 photos" }).last().click();
    await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 90_000 });
    const summary = page.getByRole("list", { name: "Other marketplaces in this ZIP" });
    await expect(summary).toContainText("Flipkart");
    await expect(summary).toContainText("Meesho");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).last().click()]);
    expect(download.suggestedFilename()).toBe("idoconverter-product-photos.zip");
    const zip = readZip(await download.path());
    for (const [folder, size] of [["idoconverter-amazon-in-main/", 1600], ["idoconverter-flipkart-primary/", 1500], ["idoconverter-meesho-first/", 1200]] as const) {
      const names = [...zip.keys()].filter(n => n.startsWith(folder));
      expect(names, folder).toContain(`${folder}report.csv`);
      const photos = names.filter(n => n.endsWith(".jpg"));
      expect(photos.length, folder).toBeGreaterThanOrEqual(3);
      expect(await inspectImage(page, zip.get(photos[0])!, 0, 0), folder).toMatchObject({ w: size, h: size });
      expect(zip.get(`${folder}report.csv`)!.toString("utf8").trim().split("\r\n")).toHaveLength(5);
    }
  });
});

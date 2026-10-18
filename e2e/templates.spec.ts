import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { inspectImage } from "./helpers";

const fx = (f: string) => path.join(__dirname, "fixtures", f);

test("the gallery filters by size and purpose", async ({ page }) => {
  await page.goto("/templates");
  const list = page.getByRole("list", { name: "Templates" });
  await expect(list.getByRole("listitem")).toHaveCount(8);
  await page.getByRole("group", { name: "Size" }).getByRole("button", { name: "Story" }).click();
  await expect(list.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("group", { name: "Purpose" }).getByRole("button", { name: "Quotes" }).click();
  await expect(page.getByText("No templates match both filters.")).toBeVisible();
  await page.getByRole("button", { name: "Show all templates" }).click();
  await expect(list.getByRole("listitem")).toHaveCount(8);
  await list.getByRole("link", { name: "Weekend sale" }).click();
  await expect(page).toHaveURL(/\/templates\/weekend-sale$/);
  await expect(page.getByRole("heading", { level: 1, name: "Weekend sale" })).toBeVisible();
});

test("edits change the downloaded file, undo works and the draft survives a reload", async ({ page }) => {
  await page.goto("/templates/weekend-sale");
  await page.getByLabel("Headline", { exact: true }).fill("Diwali dhamaka");
  await page.getByLabel("Background", { exact: true }).fill("#0a7a3c");
  await page.getByRole("button", { name: "Undo" }).click(); // back to the original background
  await expect(page.getByLabel("Background", { exact: true })).toHaveValue("#111827");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue("Diwali dhamaka");

  await page.getByRole("group", { name: "File type" }).getByRole("button", { name: "JPG" }).click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download JPG" }).click()]);
  expect(download.suggestedFilename()).toBe("weekend-sale.jpg");
  const px = await inspectImage(page, fs.readFileSync(await download.path()), 5, 5);
  expect(px).toMatchObject({ w: 1080, h: 1080 });
  expect(Math.abs(px.rgba[0] - 0x0a)).toBeLessThan(6);
  expect(Math.abs(px.rgba[1] - 0x7a)).toBeLessThan(6);
  expect(Math.abs(px.rgba[2] - 0x3c)).toBeLessThan(6);

  await page.waitForTimeout(600); // the draft saves 400 ms after the last change
  await page.reload();
  await expect(page.getByText("We restored your last edits to this template.")).toBeVisible();
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue("Diwali dhamaka");
  await page.getByRole("button", { name: "Reset to template" }).click();
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue("Up to 50% off");
});

test("your own photo replaces the sample in the export", async ({ page }) => {
  await page.goto("/templates/video-thumbnail");
  await page.getByLabel("Add your photo").setInputFiles(fx("logo-transparent.png")); // blue shape on transparent
  await page.getByRole("button", { name: "Fill the frame" }).click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PNG" }).click()]);
  const buf = fs.readFileSync(await download.path());
  // Photo box centre: x = (0.57 + 0.18) × 1280, y = 0.5 × 720; the shape fills the middle of the logo file.
  const centre = await inspectImage(page, buf, 960, 360);
  const shape = (await inspectImage(page, fs.readFileSync(fx("logo-transparent.png")), 600, 400)).rgba;
  expect(centre).toMatchObject({ w: 1280, h: 720 });
  for (let i = 0; i < 3; i++) expect(Math.abs(centre.rgba[i] - shape[i])).toBeLessThan(12);
});

test("unknown templates are a 404 and editor pages aren't indexed", async ({ page, request }) => {
  expect((await request.get("/templates/no-such-template")).status()).toBe(404);
  await page.goto("/templates/seller-tip");
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
});

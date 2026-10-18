import path from "node:path";
import { expect, test } from "@playwright/test";
import { isJpeg, isWebp, pngSize, readZip } from "./helpers";

const fx = (f: string) => path.join(__dirname, "fixtures", f);

test("converts a mixed batch to WebP, keeps going past a corrupt file, and zips real WebP files", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("logo-transparent.png"), fx("photo-wide.jpg"), fx("corrupt.jpg")]);
  await page.getByRole("button", { name: "Convert 3 images" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "2 ready · 1 failed" })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/Couldn’t read this image/)).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).last().click()]);
  const zip = readZip(await download.path());
  expect([...zip.keys()].sort()).toEqual(["idoconverter-converted/logo-transparent.webp", "idoconverter-converted/photo-wide.webp"]);
  for (const buf of zip.values()) expect(isWebp(buf)).toBe(true);
});

test("resizes and rotates to PNG with exact dimensions", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg")]);
  await page.getByRole("radio", { name: /^PNG/ }).check();
  await page.getByRole("radio", { name: "Longest side" }).check();
  await page.getByRole("spinbutton", { name: "Longest side" }).fill("500");
  await page.getByRole("button", { name: "90°" }).click();
  await page.getByRole("button", { name: "Convert 1 image" }).last().click();
  await expect(page.getByText("250×500")).toBeVisible({ timeout: 30_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download photo-wide.png" }).click()]);
  const fs = await import("node:fs");
  const buf = fs.readFileSync(await download.path());
  expect(pngSize(buf)).toEqual({ w: 250, h: 500 });
});

test("rejects unsupported files at the door and validates settings", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([{ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") }]);
  await expect(page.getByText(/1 skipped: only JPG, PNG and WebP/)).toBeVisible();
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg")]);
  await page.getByRole("spinbutton", { name: "Quality" }).fill("0");
  await expect(page.getByText("Use 10–100 %.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Convert 1 image" }).last()).toBeDisabled();
});

test("JPG output flattens transparency and neutralises formula-like names", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("logo-transparent.png"), fx("=SUM(A1).jpg")]);
  await page.getByRole("radio", { name: /^JPG/ }).check();
  await page.getByRole("button", { name: "Convert 2 images" }).last().click();
  await expect(page.getByText(/Transparent areas, if any, are now white/)).toBeVisible({ timeout: 30_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).last().click()]);
  const zip = readZip(await download.path());
  expect([...zip.keys()]).toContain("idoconverter-converted/=SUM(A1).jpg");
  for (const buf of zip.values()) expect(isJpeg(buf)).toBe(true);
});

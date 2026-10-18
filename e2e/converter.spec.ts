import path from "node:path";
import { expect, test } from "@playwright/test";
import fs from "node:fs";
import { inspectImage, isJpeg, isWebp, pngSize, readZip } from "./helpers";

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

const downloadOne = async (page: import("@playwright/test").Page, name: string) => {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: `Download ${name}` }).click()]);
  return fs.readFileSync(await download.path());
};

test("crops the centre to a square", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg")]); // 2000 × 1000
  await page.getByRole("radio", { name: /^PNG/ }).check();
  await page.getByRole("group", { name: "Aspect ratio" }).getByRole("button", { name: "1:1" }).click();
  await page.getByRole("button", { name: "Convert 1 image" }).last().click();
  await expect(page.getByText("1000×1000")).toBeVisible({ timeout: 30_000 });
  expect(pngSize(await downloadOne(page, "photo-wide.png"))).toEqual({ w: 1000, h: 1000 });
});

test("pads to a square with a transparent or coloured background, keeping the whole image", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("logo-transparent.png")]); // 1200 × 800
  await page.getByRole("radio", { name: /^PNG/ }).check();
  await page.getByRole("group", { name: "Aspect ratio" }).getByRole("button", { name: "1:1" }).click();
  await page.getByRole("radio", { name: /^Add padding/ }).check();
  await page.getByRole("group", { name: "Background colour" }).getByRole("button", { name: "Transparent" }).click();
  await page.getByRole("button", { name: "Convert 1 image" }).last().click();
  await expect(page.getByText("1200×1200")).toBeVisible({ timeout: 30_000 });
  const clear = await inspectImage(page, await downloadOne(page, "logo-transparent.png"), 5, 5);
  expect(clear).toMatchObject({ w: 1200, h: 1200 });
  expect(clear.rgba[3]).toBe(0); // padding is see-through

  await page.getByRole("group", { name: "Background colour" }).getByRole("button", { name: "Colour" }).click();
  await page.getByLabel("Custom colour").fill("#1f4fd1");
  await page.getByRole("button", { name: "Convert 1 image" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "1 ready" })).toBeVisible({ timeout: 30_000 });
  const blue = await inspectImage(page, await downloadOne(page, "logo-transparent.png"), 5, 5);
  expect(blue.rgba).toEqual([0x1f, 0x4f, 0xd1, 255]);
});

test("makes an exact size from a custom ratio and a width", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg")]);
  await page.getByRole("group", { name: "Aspect ratio" }).getByRole("button", { name: "Custom" }).click();
  await page.getByRole("spinbutton", { name: "Ratio width" }).fill("1200");
  await page.getByRole("spinbutton", { name: "Ratio height" }).fill("628");
  await page.getByRole("radio", { name: "Width", exact: true }).check();
  await page.getByRole("spinbutton", { name: "Width", exact: true }).fill("1200");
  await page.getByRole("button", { name: "Convert 1 image" }).last().click();
  await expect(page.getByText("1200×628")).toBeVisible({ timeout: 30_000 });
  const buf = await downloadOne(page, "photo-wide.webp");
  expect(isWebp(buf)).toBe(true);
  expect(await inspectImage(page, buf, 0, 0)).toMatchObject({ w: 1200, h: 628 });
});

test("judges files by content: a PNG named .jpg is accepted as PNG, a fake image is refused", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([
    { name: "really-a-png.jpg", mimeType: "image/jpeg", buffer: fs.readFileSync(fx("logo-transparent.png")) },
    { name: "fake.png", mimeType: "image/png", buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>") },
  ]);
  await expect(page.getByText(/1 skipped: only JPG, PNG and WebP/)).toBeVisible();
  await page.getByRole("radio", { name: /^Keep format/ }).check();
  await page.getByRole("button", { name: "Convert 1 image" }).last().click();
  expect(pngSize(await downloadOne(page, "really-a-png.png"))).toEqual({ w: 1200, h: 800 });
});

test("a converted image can be removed and is left out of the ZIP", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg"), fx("logo-transparent.png")]);
  await page.getByRole("button", { name: "Convert 2 images" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "2 ready" })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Remove photo-wide.jpg" }).click();
  await expect(page.getByRole("status").filter({ hasText: "1 ready" })).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).last().click()]);
  expect([...readZip(await download.path()).keys()]).toEqual(["idoconverter-converted/logo-transparent.webp"]);
});

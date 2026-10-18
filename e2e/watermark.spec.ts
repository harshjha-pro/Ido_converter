import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { inspectImage, isJpeg, readZip } from "./helpers";

const fx = (f: string) => path.join(__dirname, "fixtures", f);

/** Counts pixels close to a colour, so text marks can be checked without knowing glyph positions. */
async function countNear(page: Page, buf: Buffer, rgb: [number, number, number], tol = 40) {
  return page.evaluate(async ({ b64, rgb, tol }) => {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([bytes]));
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = c.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - rgb[0]) < tol && Math.abs(d[i + 1] - rgb[1]) < tol && Math.abs(d[i + 2] - rgb[2]) < tol) n++;
    return n;
  }, { b64: buf.toString("base64"), rgb, tol });
}

test("needs text before it can run, then stamps red text on every image", async ({ page }) => {
  await page.goto("/tools/watermark");
  await page.locator("input[type=file]").first().setInputFiles([fx("photo-wide.jpg")]);
  await expect(page.getByRole("button", { name: "Watermark 1 image" }).last()).toBeDisabled();
  await expect(page.getByText("Enter the watermark text first.").first()).toBeVisible();

  const original = fs.readFileSync(fx("photo-wide.jpg"));
  const redBefore = await countNear(page, original, [255, 0, 0]);
  await page.getByRole("textbox", { name: "Text", exact: true }).fill("MY SHOP");
  await page.getByLabel("Text colour").fill("#ff0000");
  await page.getByRole("spinbutton", { name: "Text size" }).fill("20");
  await page.getByRole("spinbutton", { name: "Opacity" }).fill("100");
  await page.getByRole("button", { name: "Centre" }).click();
  await page.getByRole("button", { name: "Watermark 1 image" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "1 ready" })).toBeVisible({ timeout: 30_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download photo-wide.jpg" }).click()]);
  const out = fs.readFileSync(await download.path());
  expect(isJpeg(out)).toBe(true);
  expect(await inspectImage(page, out, 0, 0)).toMatchObject({ w: 2000, h: 1000 });
  expect(await countNear(page, out, [255, 0, 0])).toBeGreaterThan(redBefore + 5000);
});

test("places a logo at the chosen corner and zips the batch", async ({ page }) => {
  await page.goto("/tools/watermark");
  await page.locator("input[type=file]").first().setInputFiles([fx("photo-wide.jpg"), fx("=SUM(A1).jpg")]);
  await page.getByRole("radio", { name: /^Logo/ }).check();
  await page.getByLabel("Choose a logo").setInputFiles(fx("logo-transparent.png")); // 1200 × 800, opaque shape in the middle
  await expect(page.getByRole("button", { name: "Remove logo logo-transparent.png" })).toBeVisible();
  await page.getByRole("spinbutton", { name: "Logo width" }).fill("50");
  await page.getByRole("spinbutton", { name: "Opacity" }).fill("100");
  await page.getByRole("button", { name: "Top left" }).click();
  await page.getByRole("spinbutton", { name: "Margin" }).fill("0");
  await page.getByRole("button", { name: "Watermark 2 images" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "2 ready" })).toBeVisible({ timeout: 30_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download ZIP" }).last().click()]);
  const zip = readZip(await download.path());
  expect([...zip.keys()].sort()).toEqual(["idoconverter-watermarked/=SUM(A1).jpg", "idoconverter-watermarked/photo-wide.jpg"]);
  // The logo is 1000 px wide on a 2000 px image at the top-left, so its centre lands at (500, 333).
  const logoCentre = (await inspectImage(page, fs.readFileSync(fx("logo-transparent.png")), 600, 400)).rgba;
  const stamped = (await inspectImage(page, zip.get("idoconverter-watermarked/photo-wide.jpg")!, 500, 333)).rgba;
  for (let i = 0; i < 3; i++) expect(Math.abs(stamped[i] - logoCentre[i])).toBeLessThan(12);
});

test("refuses a logo that isn't an image", async ({ page }) => {
  await page.goto("/tools/watermark");
  await page.locator("input[type=file]").first().setInputFiles([fx("photo-wide.jpg")]);
  await page.getByRole("radio", { name: /^Logo/ }).check();
  await page.getByLabel("Choose a logo").setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: Buffer.from("<svg onload=alert(1)>") });
  await expect(page.getByRole("alert").filter({ hasText: "isn’t a JPG, PNG or WebP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Watermark 1 image" }).last()).toBeDisabled();
});

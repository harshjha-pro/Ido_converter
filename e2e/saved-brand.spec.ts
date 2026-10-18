import path from "node:path";
import { expect, test } from "@playwright/test";

const fx = (f: string) => path.join(__dirname, "fixtures", f);

test("converter settings can be saved, survive a reload and be applied", async ({ page }) => {
  await page.goto("/tools/image-converter");
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg")]);
  await page.getByRole("radio", { name: /^PNG/ }).check();
  await page.getByRole("group", { name: "Aspect ratio" }).getByRole("button", { name: "1:1" }).click();
  await page.getByText("Saved settings").click();
  await page.getByLabel("Save current settings as").fill("Square PNG");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved “Square PNG” on this device.")).toBeVisible();

  await page.reload();
  await page.locator("input[type=file]").setInputFiles([fx("photo-wide.jpg")]);
  await expect(page.getByRole("radio", { name: /^WebP/ })).toBeChecked(); // defaults until applied
  await page.getByText("Saved settings (1)").click();
  await page.getByLabel("Use saved settings").selectOption("Square PNG");
  await expect(page.getByRole("radio", { name: /^PNG/ })).toBeChecked();
  await expect(page.getByRole("group", { name: "Aspect ratio" }).getByRole("button", { name: "1:1" })).toHaveAttribute("aria-pressed", "true");
});

test("the brand kit fills the watermark tool's name, colour and logo", async ({ page }) => {
  await page.goto("/brand-kit");
  await page.getByLabel("Shop or brand name").fill("Teal & Co");
  await page.getByLabel("Choose a logo").setInputFiles(fx("logo-transparent.png"));
  await expect(page.getByRole("img", { name: "Your brand logo" })).toBeVisible();
  await page.getByRole("button", { name: "Add a colour" }).click();
  await page.getByLabel("Colour 1", { exact: true }).fill("#1f4fd1");
  await page.getByRole("button", { name: "Save brand kit" }).click();
  await expect(page.getByText("Brand kit saved on this device.")).toBeVisible();

  await page.goto("/tools/watermark");
  await page.locator("input[type=file]").first().setInputFiles([fx("photo-wide.jpg")]);
  await page.getByRole("button", { name: "Use my shop name" }).click();
  await expect(page.getByRole("textbox", { name: "Text", exact: true })).toHaveValue("Teal & Co");
  await page.getByRole("group", { name: "Brand colours" }).getByRole("button", { name: "#1F4FD1" }).click();
  await expect(page.getByLabel("Text colour")).toHaveValue("#1f4fd1");
  await page.getByRole("radio", { name: /^Logo/ }).check();
  await page.getByRole("button", { name: "Use my brand kit logo" }).click();
  await expect(page.getByRole("button", { name: "Remove logo brand-logo.png" })).toBeVisible();
  await page.getByRole("button", { name: "Watermark 1 image" }).last().click();
  await expect(page.getByRole("status").filter({ hasText: "1 ready" })).toBeVisible({ timeout: 30_000 });

  await page.goto("/brand-kit");
  await page.getByRole("button", { name: "Clear brand kit" }).click();
  await expect(page.getByLabel("Shop or brand name")).toHaveValue("");
});

test("the brand kit page is kept out of search", async ({ page, request }) => {
  await page.goto("/brand-kit");
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/brand-kit");
});

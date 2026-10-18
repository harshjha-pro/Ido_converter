import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PUBLIC_ROUTES } from "../lib/routes";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://idoconverter.com").replace(/\/$/, "");
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("SEO", () => {
  test("every public page has a unique title, description, one H1, canonical, sharing tags and valid JSON-LD", async ({ page, request }) => {
    const titles = new Set<string>(), descs = new Set<string>();
    for (const r of PUBLIC_ROUTES) {
      const res = await request.get(r.path);
      expect(res.status(), r.path).toBe(200);
      await page.goto(r.path);
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(title.length, `${r.path} title length`).toBeLessThanOrEqual(70);
      expect(desc?.length ?? 0, `${r.path} description length`).toBeGreaterThan(70);
      expect(desc!.length, `${r.path} description length`).toBeLessThanOrEqual(170);
      expect(titles.has(title), `${r.path} duplicate title`).toBe(false);
      expect(descs.has(desc!), `${r.path} duplicate description`).toBe(false);
      titles.add(title); descs.add(desc!);
      await expect(page.locator("h1"), `${r.path} H1 count`).toHaveCount(1);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe(`${SITE}${r.path === "/" ? "" : r.path}`);
      expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toBe(`${SITE}/og.png`);
      expect(await page.locator('meta[name="robots"]').count(), `${r.path} must be indexable`).toBe(0);
      for (const json of await page.locator('script[type="application/ld+json"]').allTextContents()) {
        const data = JSON.parse(json);
        for (const item of Array.isArray(data) ? data : [data]) {
          expect(item["@context"]).toBe("https://schema.org");
          expect(typeof item["@type"]).toBe("string");
        }
        expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review|"price"/);
      }
    }
  });

  test("robots.txt and sitemap.xml agree with the route list", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/api\//);
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const r of PUBLIC_ROUTES) expect(sitemap).toContain(`<loc>${SITE}${r.path === "/" ? "" : r.path}</loc>`);
    expect(sitemap).not.toContain("/api/");
  });

  test("unknown pages return 404 and aren't indexed", async ({ page, request }) => {
    expect((await request.get("/no-such-page")).status()).toBe(404);
    await page.goto("/no-such-page");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
  });
});

test.describe("accessibility (axe, WCAG 2.2 AA rules)", () => {
  for (const r of PUBLIC_ROUTES) {
    test(`no violations on ${r.path}`, async ({ page }) => {
      await page.goto(r.path);
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(results.violations.map(v => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
    });
  }

  test("no violations in the product-photo tool after processing, with the form errors showing", async ({ page }) => {
    await page.goto("/product-photos?samples=1");
    await expect(page.getByRole("status").filter({ hasText: "4 photos ready to process" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Process 4 photos" }).last().click();
    await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 60_000 });
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations.map(v => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
  });

  test("no violations in the early-access form error state", async ({ page }) => {
    await page.goto("/#early-access");
    await page.getByRole("button", { name: "Join early access" }).click();
    await expect(page.getByText("Choose at least one.")).toBeVisible();
    const results = await new AxeBuilder({ page }).include("#early-access").withTags(WCAG).analyze();
    expect(results.violations.map(v => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
  });
});

test.describe("layout", () => {
  test("site styles load: the header shows the right navigation for the viewport", async ({ page }, info) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const menu = page.getByRole("button", { name: "Menu" });
    if (info.project.name === "desktop") {
      await expect(nav).toBeVisible();
      await expect(menu).toBeHidden();
    } else {
      await expect(nav).toBeHidden();
      await menu.click();
      await expect(nav.getByRole("link", { name: "Image converter" })).toBeVisible();
    }
    // Footer lists are unstyled bullets only if site.module.css failed to load.
    expect(await page.locator("footer ul").first().evaluate(el => getComputedStyle(el).listStyleType)).toBe("none");
  });

  test("no page scrolls sideways at 360 px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    for (const r of PUBLIC_ROUTES) {
      await page.goto(r.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), r.path).toBe(0);
    }
  });

  test("converter settings fit inside their panel", async ({ page }) => {
    await page.goto("/tools/image-converter");
    await page.locator("input[type=file]").setInputFiles(["e2e/fixtures/photo-wide.jpg"]);
    await page.getByRole("group", { name: "Aspect ratio" }).getByRole("button", { name: "Custom" }).click();
    const panel = page.locator("aside").first();
    expect(await panel.evaluate(el => el.scrollWidth - el.clientWidth)).toBe(0);
  });
});

test.describe("keyboard and focus", () => {
  test("removing a file keeps focus in the list, then on the drop zone", async ({ page }) => {
    await page.goto("/tools/image-converter");
    await page.locator("input[type=file]").setInputFiles(["e2e/fixtures/photo-wide.jpg", "e2e/fixtures/logo-transparent.png"]);
    await page.getByRole("button", { name: "Remove photo-wide.jpg" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Remove logo-transparent.png" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-dropzone] input")).toBeFocused();
  });

  test("the photo details sheet keeps Tab inside it and returns focus on Escape", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "the details panel is a modal sheet only on small screens");
    await page.route("**/api/events/batch", route => route.fulfill({ status: 204, body: "" }));
    await page.goto("/product-photos?samples=1");
    await page.getByRole("button", { name: "Process 4 photos" }).last().click();
    await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 60_000 });
    const tile = page.getByRole("button", { name: /^teal-mug\.jpg: / });
    await tile.focus();
    await page.keyboard.press("Enter");
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("button", { name: "Close", exact: true })).toBeFocused();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press(i % 4 === 3 ? "Shift+Tab" : "Tab");
      expect(await sheet.evaluate(el => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(tile).toBeFocused();
  });
});

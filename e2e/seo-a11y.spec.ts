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

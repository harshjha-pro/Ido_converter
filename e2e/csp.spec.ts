import { expect, test } from "@playwright/test";
import { PUBLIC_ROUTES } from "../lib/routes";

const nonceOf = (csp: string | undefined) => csp?.match(/'nonce-([^']+)'/)?.[1];

test.describe("Content-Security-Policy", () => {
  test("every page sends a nonce'd policy, fresh per request, and its inline scripts carry the nonce", async ({ request }) => {
    for (const path of [...PUBLIC_ROUTES.map(r => r.path), "/no-such-page"]) {
      const first = await request.get(path), second = await request.get(path);
      const csp = first.headers()["content-security-policy"];
      expect(csp, path).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
      expect(csp, path).not.toContain("unsafe-");
      const nonce = nonceOf(csp)!;
      expect(nonceOf(second.headers()["content-security-policy"]), `${path} nonce reused`).not.toBe(nonce);
      const html = await first.text();
      const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map(m => m[1]).filter(a => !/type="application\/ld\+json"/.test(a));
      expect(scripts.length, path).toBeGreaterThan(0);
      for (const attrs of scripts) expect(attrs, `${path} script without nonce`).toContain(`nonce="${nonce}"`);
      expect(html, `${path} inline style attribute`).not.toMatch(/<[^>]+\sstyle="/);
    }
  });

  test("API responses and static files are left without a page policy", async ({ request }) => {
    expect((await request.get("/api/health")).headers()["content-security-policy"]).toBeUndefined();
    expect((await request.get("/robots.txt")).headers()["content-security-policy"]).toBeUndefined();
  });

  test("pages hydrate and the image worker runs with no policy violations", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", m => { if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text()); });
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", e => console.error(`Refused to load: ${e.violatedDirective} ${e.blockedURI}`));
    });
    for (const r of PUBLIC_ROUTES) await page.goto(r.path, { waitUntil: "networkidle" });
    // The sample batch exercises fetch, the Web Worker, blob: previews and the ZIP download.
    await page.goto("/product-photos?samples=1");
    await expect(page.getByRole("status").filter({ hasText: "4 photos ready to process" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Process 4 photos" }).last().click();
    await expect(page.getByRole("button", { name: "Download ZIP" }).last()).toBeVisible({ timeout: 60_000 });
    expect(violations).toEqual([]);
  });
});

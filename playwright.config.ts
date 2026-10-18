import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running production build:
 *   npm run build && npm start   (with DATABASE_URL pointing at a *_dev database)
 *   E2E_BASE_URL=http://localhost:3000 E2E_DATABASE_URL=mysql://... npm run test:e2e
 * PW_CHROMIUM_PATH lets you reuse an existing Chromium instead of downloading one.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 5"], colorScheme: "dark" } },
  ],
});

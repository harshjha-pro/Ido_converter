import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    projects: [
      { extends: true, test: { name: "unit", include: ["tests/unit/**/*.test.ts", "tests/components/**/*.test.tsx"], environment: "node" } },
      { extends: true, test: { name: "db", include: ["tests/integration/**/*.test.ts"], environment: "node", fileParallelism: false, testTimeout: 20_000, hookTimeout: 30_000 } },
    ],
  },
});

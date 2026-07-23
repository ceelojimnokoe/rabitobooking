import { defineConfig, devices } from "@playwright/test";

// The Playwright test runner is a separate Node process from the `npm run
// dev` child it spawns for webServer — Next.js loads .env.local for that
// child itself, but Playwright never did for its own process, so
// DB-gated tests (see e2e/helpers.ts) always skipped even when
// .env.local had real credentials. Loading it here (if present) fixes
// that, without adding a dotenv dependency.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — fine, DB-gated tests will just skip as documented.
}

const PORT = 3000;
const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

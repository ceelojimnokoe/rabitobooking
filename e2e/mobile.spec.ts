import { test, expect } from "@playwright/test";

/**
 * Runs under the "mobile-chromium" Playwright project (Pixel 7 viewport —
 * see playwright.config.ts testMatch for this file).
 */

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe("Mobile viewport", () => {
  test("landing page renders without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Book Your Clinic Appointment" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("booking page renders without horizontal scroll", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("admin login page renders without horizontal scroll", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Administrator login" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

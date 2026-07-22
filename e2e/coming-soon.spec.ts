import { test, expect } from "@playwright/test";

test.describe("Coming soon features", () => {
  test("clicking a coming-soon card shows a toast and does not navigate", async ({ page }) => {
    await page.goto("/");
    const startUrl = page.url();

    await page.getByRole("button", { name: /Patient Portal/ }).click();

    await expect(
      page.getByText(/Patient Portal is part of the proposed future platform/),
    ).toBeVisible();
    expect(page.url()).toBe(startUrl);

    // No broken-page indicators.
    await expect(page.getByRole("heading", { name: "404" })).toHaveCount(0);
  });

  test("all three coming-soon cards are visibly marked", async ({ page }) => {
    await page.goto("/");
    const badges = page.getByText("Coming Soon");
    await expect(badges).toHaveCount(3);

    for (const name of ["Patient Portal", "Teleconsultations", "Lab Results"]) {
      await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
    }
  });
});

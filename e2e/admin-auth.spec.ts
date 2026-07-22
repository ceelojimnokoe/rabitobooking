import { test, expect } from "@playwright/test";
import { hasNonAdminCredentials, nonAdminCredentials } from "./helpers";

test.describe("Admin route protection", () => {
  test("unauthenticated visitors cannot open the admin dashboard", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Administrator login" })).toBeVisible();
  });

  test("unauthenticated visitors cannot open an appointment detail page", async ({ page }) => {
    await page.goto("/admin/appointments/00000000-0000-0000-0000-000000000000");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test(
    "an authenticated but non-allowlisted user cannot open the dashboard",
    async ({ page }) => {
      test.skip(
        !hasNonAdminCredentials,
        "Requires E2E_NON_ADMIN_EMAIL/E2E_NON_ADMIN_PASSWORD for a real (non-allowlisted) Supabase account",
      );

      await page.goto("/admin/login");
      await page.getByLabel("Email").fill(nonAdminCredentials.email!);
      await page.getByLabel("Password").fill(nonAdminCredentials.password!);
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page).toHaveURL(/\/admin\/login\?error=not_allowlisted/);
      await expect(page.getByText(/isn't on this demo's administrator allowlist/)).toBeVisible();
    },
  );
});

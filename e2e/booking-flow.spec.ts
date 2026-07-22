import { test, expect } from "@playwright/test";
import { hasDatabaseConfig, submitBookingRequest, futureWeekdayISO } from "./helpers";

test.describe("Booking flow", () => {
  test("patient can move through all booking steps to review", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByText("Step 1 of 4")).toBeVisible();

    await page.getByLabel("Full name").fill("Ama Mensah");
    await page.getByLabel("Contact number").fill("0244123456");
    await page.getByLabel("Email address").fill("ama.mensah@example.com");
    await page.getByText("New patient", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Step 2 of 4")).toBeVisible();
    await page.getByText("Chief Dermatology", { exact: true }).click();
    await page.getByText("Osu", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Step 3 of 4")).toBeVisible();
    await page.getByLabel("Preferred date").fill(futureWeekdayISO());
    await page.getByRole("button", { name: "9:00 AM", exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Step 4 of 4")).toBeVisible();
    await expect(page.getByText("Ama Mensah")).toBeVisible();
    await expect(page.getByText("Chief Dermatology")).toBeVisible();
    await expect(page.getByText("Osu")).toBeVisible();
    await expect(page.getByText("New patient")).toBeVisible();
  });

  test("required field validation blocks progressing from step 1", async ({ page }) => {
    await page.goto("/book");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Enter your full name.")).toBeVisible();
    await expect(page.getByText("Enter a contact number.")).toBeVisible();
    await expect(page.getByText("Enter your email address.")).toBeVisible();
    // Still on step 1.
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });

  test("invalid phone number is rejected", async ({ page }) => {
    await page.goto("/book");
    await page.getByLabel("Full name").fill("Ama Mensah");
    await page.getByLabel("Contact number").fill("12345");
    await page.getByLabel("Email address").fill("ama.mensah@example.com");
    await page.getByText("New patient", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/Enter a valid Ghanaian number/)).toBeVisible();
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
  });

  test("past dates cannot be selected", async ({ page }) => {
    await page.goto("/book");
    await page.getByLabel("Full name").fill("Ama Mensah");
    await page.getByLabel("Contact number").fill("0244123456");
    await page.getByLabel("Email address").fill("ama.mensah@example.com");
    await page.getByText("New patient", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("General Health", { exact: true }).click();
    await page.getByText("Osu", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    const dateInput = page.getByLabel("Preferred date");
    const minAttr = await dateInput.getAttribute("min");
    const today = new Date().toISOString().slice(0, 10);
    // The date input's min bound must never allow yesterday or earlier.
    expect(minAttr! >= today).toBe(true);
  });

  test("Koforidua is closed on weekends", async ({ page }) => {
    await page.goto("/book");
    await page.getByLabel("Full name").fill("Ama Mensah");
    await page.getByLabel("Contact number").fill("0244123456");
    await page.getByLabel("Email address").fill("ama.mensah@example.com");
    await page.getByText("New patient", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("General Health", { exact: true }).click();
    await page.getByText("Koforidua", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // Find the next Saturday or Sunday from today.
    const weekendDay = new Date();
    while (weekendDay.getDay() !== 0 && weekendDay.getDay() !== 6) {
      weekendDay.setDate(weekendDay.getDate() + 1);
    }
    // Ensure it's not today (would be excluded by "past" logic instead).
    if (weekendDay.toDateString() === new Date().toDateString()) {
      weekendDay.setDate(weekendDay.getDate() + 7);
    }
    const weekendIso = weekendDay.toISOString().slice(0, 10);

    await page.getByLabel("Preferred date").fill(weekendIso);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText(/Koforidua is closed on weekends/)).toBeVisible();
    await expect(page.getByText("Step 3 of 4")).toBeVisible();
  });

  test("a default branch stays open on weekends", async ({ page }) => {
    await page.goto("/book");
    await page.getByLabel("Full name").fill("Ama Mensah");
    await page.getByLabel("Contact number").fill("0244123456");
    await page.getByLabel("Email address").fill("ama.mensah@example.com");
    await page.getByText("New patient", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("General Health", { exact: true }).click();
    await page.getByText("Osu", { exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    const saturday = new Date();
    while (saturday.getDay() !== 6) saturday.setDate(saturday.getDate() + 1);
    const saturdayIso = saturday.toISOString().slice(0, 10);

    await page.getByLabel("Preferred date").fill(saturdayIso);

    // Weekend hours are 8am-2pm, so a morning slot should be offered and no
    // "closed" error should appear.
    await expect(page.getByRole("button", { name: "9:00 AM", exact: true })).toBeVisible();
    await expect(page.getByText(/is closed/)).toHaveCount(0);
  });

  test(
    "valid request is saved as pending and returns a request reference",
    async ({ page }) => {
      test.skip(!hasDatabaseConfig, "Requires a configured Supabase project — see README-DEMO-SETUP.md");

      const reference = await submitBookingRequest(page, {
        fullName: "Kofi Appiah",
        phone: "0244555000",
        email: `kofi.appiah.${Date.now()}@example.com`,
        patientType: "new",
        service: "General Health",
        branch: "Osu",
        date: futureWeekdayISO(10),
        timeLabel: "11:00 AM",
      });

      expect(reference).toMatch(/^REQ-\d{4}-[A-Z0-9]{6}$/);
      await expect(page.getByText("Request submitted")).toBeVisible();
      await expect(
        page.getByText("This is not yet a confirmed appointment."),
      ).toBeVisible();
    },
  );
});

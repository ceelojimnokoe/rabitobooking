import { test, expect } from "@playwright/test";
import {
  hasAdminCredentials,
  hasDatabaseConfig,
  submitBookingRequest,
  loginAsAdmin,
  openAppointmentByReference,
  futureWeekdayISO,
} from "./helpers";

const canRunAdminFlow = hasDatabaseConfig && hasAdminCredentials;
const skipReason =
  "Requires a configured Supabase project plus E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD for an allowlisted admin account — see README-DEMO-SETUP.md";

test.describe("Admin appointment management", () => {
  test.skip(!canRunAdminFlow, skipReason);

  test("administrator can log in and see the dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("heading", { name: "Appointment requests" })).toBeVisible();
    await expect(page.getByText("Pending requests")).toBeVisible();
  });

  test("administrator can open a pending request and confirm it", async ({ page }) => {
    const reference = await submitBookingRequest(page, {
      fullName: "Efo Danso",
      phone: "0244777001",
      email: `efo.danso.${Date.now()}@example.com`,
      service: "General Health",
      branch: "Tema Clinic",
      date: futureWeekdayISO(15),
      timeLabel: "1:00 PM",
    });

    await loginAsAdmin(page);
    await openAppointmentByReference(page, reference);

    await expect(page.getByRole("heading", { name: "Efo Danso" })).toBeVisible();
    await page.getByRole("button", { name: "Confirm appointment" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, confirm" }).click();

    await expect(page.getByText("Appointment confirmed")).toBeVisible();
    await expect(page.getByText(/^RAB-\d{4}-[A-Z0-9]{6}$/)).toBeVisible();
  });

  test("administrator can reject a request with a reason", async ({ page }) => {
    const reference = await submitBookingRequest(page, {
      fullName: "Nhyira Osei",
      phone: "0244777002",
      email: `nhyira.osei.${Date.now()}@example.com`,
      service: "Rabito Cosmetic Centre",
      branch: "Kumasi Clinic",
      date: futureWeekdayISO(16),
      timeLabel: "2:30 PM",
    });

    await loginAsAdmin(page);
    await openAppointmentByReference(page, reference);

    await page
      .getByLabel("Reason if rejecting (shared with patient)")
      .fill("That time is no longer available. Please submit a new request.");
    await page.getByRole("button", { name: "Reject request" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, reject" }).click();

    await expect(page.getByText("Request rejected")).toBeVisible();
  });

  test("confirming a second appointment in the same slot is blocked", async ({ page }) => {
    const date = futureWeekdayISO(20);

    const referenceA = await submitBookingRequest(page, {
      fullName: "Kobby Antwi",
      phone: "0244777003",
      email: `kobby.antwi.${Date.now()}@example.com`,
      service: "General Health",
      branch: "Accra Clinic",
      date,
      timeLabel: "3:00 PM",
    });
    const referenceB = await submitBookingRequest(page, {
      fullName: "Serwaa Boadi",
      phone: "0244777004",
      email: `serwaa.boadi.${Date.now()}@example.com`,
      service: "General Health",
      branch: "Accra Clinic",
      date,
      timeLabel: "3:00 PM",
    });

    await loginAsAdmin(page);

    await openAppointmentByReference(page, referenceA);
    await page.getByRole("button", { name: "Confirm appointment" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, confirm" }).click();
    await expect(page.getByText("Appointment confirmed")).toBeVisible();

    await openAppointmentByReference(page, referenceB);
    await page.getByRole("button", { name: "Confirm appointment" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, confirm" }).click();

    await expect(
      page.getByText(/already booked by another confirmed appointment/),
    ).toBeVisible();
  });

  test("email preview is shown when Resend isn't configured", async ({ page }) => {
    test.skip(
      Boolean(process.env.RESEND_API_KEY),
      "Only applicable when Resend is not configured",
    );

    const reference = await submitBookingRequest(page, {
      fullName: "Akosua Darko",
      phone: "0244777005",
      email: `akosua.darko.${Date.now()}@example.com`,
      service: "Chief Dermatology",
      branch: "Accra Clinic",
      date: futureWeekdayISO(22),
      timeLabel: "9:30 AM",
    });

    await loginAsAdmin(page);
    await openAppointmentByReference(page, reference);
    await page.getByRole("button", { name: "Confirm appointment" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Yes, confirm" }).click();

    await expect(page.getByText(/preview only \(Resend not configured\)/)).toBeVisible();
    await page.getByRole("button", { name: "View email preview" }).click();
    await expect(
      page.frameLocator("iframe[title='Email preview']").getByText(/appointment is confirmed/i),
    ).toBeVisible();
  });
});

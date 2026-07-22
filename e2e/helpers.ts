import type { Page } from "@playwright/test";

export const hasDatabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const adminCredentials = {
  email: process.env.E2E_ADMIN_EMAIL,
  password: process.env.E2E_ADMIN_PASSWORD,
};

export const nonAdminCredentials = {
  email: process.env.E2E_NON_ADMIN_EMAIL,
  password: process.env.E2E_NON_ADMIN_PASSWORD,
};

export const hasAdminCredentials = Boolean(
  adminCredentials.email && adminCredentials.password,
);

export const hasNonAdminCredentials = Boolean(
  nonAdminCredentials.email && nonAdminCredentials.password,
);

/**
 * Picks a future weekday. Every branch is open weekdays (only Koforidua
 * closes on weekends), so this is a safe default date regardless of which
 * branch a test then selects.
 */
export function futureWeekdayISO(daysAhead = 8): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

export interface BookingDetails {
  fullName: string;
  phone: string;
  email: string;
  patientType?: "new" | "existing";
  service: string;
  branch: string;
  date: string;
  timeLabel: string;
}

/**
 * Drives the public /book wizard end to end and returns the request
 * reference from the confirmation screen.
 */
export async function submitBookingRequest(
  page: Page,
  details: BookingDetails,
): Promise<string> {
  await page.goto("/book");

  await page.getByLabel("Full name").fill(details.fullName);
  await page.getByLabel("Contact number").fill(details.phone);
  await page.getByLabel("Email address").fill(details.email);
  await page
    .getByText(details.patientType === "existing" ? "Existing patient" : "New patient", {
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByText(details.service, { exact: true }).click();
  await page.getByText(details.branch, { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Preferred date").fill(details.date);
  await page.getByRole("button", { name: details.timeLabel, exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel(/I consent to Rabito Clinic/).check();
  await page.getByRole("button", { name: "Submit request" }).click();

  const reference = page.getByText(/^REQ-\d{4}-[A-Z0-9]{6}$/);
  await reference.waitFor();
  return (await reference.textContent())!.trim();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminCredentials.email!);
  await page.getByLabel("Password").fill(adminCredentials.password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/admin$/);
}

/** Opens the dashboard and navigates to the appointment matching `reference`. */
export async function openAppointmentByReference(
  page: Page,
  reference: string,
): Promise<void> {
  await page.goto("/admin");
  await page.getByPlaceholder(/Search name, email, phone or reference/).fill(reference);
  await page.getByRole("link", { name: "View" }).first().click();
  await page.waitForURL(/\/admin\/appointments\//);
}

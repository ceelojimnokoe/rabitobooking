/**
 * Zod schema for the public booking form. Shared between the client (React
 * Hook Form resolver, validated per step) and the server (route handler,
 * full re-validation of untrusted input).
 */
import { z } from "zod";
import { isValidGhanaPhone } from "@/lib/phone";
import { services, branches } from "@/config/clinic";
import {
  validateDateKey,
  isValidTimeSlot,
  availableTimeSlots,
} from "@/lib/scheduling";

const serviceLabels = services.map((s) => s.label) as [string, ...string[]];
const branchLabels = branches.map((b) => b.label) as [string, ...string[]];

export const bookingRequestSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(100, "Name is too long."),
    phone: z
      .string()
      .trim()
      .min(1, "Enter a contact number.")
      .refine(isValidGhanaPhone, {
        message:
          "Enter a valid Ghanaian number, e.g. 024 123 4567 or +233 24 123 4567.",
      }),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    service: z.enum(serviceLabels, { message: "Select a service." }),
    branch: z.enum(branchLabels, { message: "Select a branch." }),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a date."),
    time: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/, "Select a time."),
    consent: z.literal(true, {
      message: "Consent is required to submit a request.",
    }),
    /** Hidden honeypot field — must stay empty; bots tend to fill every field. */
    companyWebsite: z.string().max(0),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const dateResult = validateDateKey(data.date, now);
    if (!dateResult.ok) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: dateResult.reason ?? "Select a valid date.",
      });
      return;
    }
    if (!isValidTimeSlot(data.time)) {
      ctx.addIssue({
        code: "custom",
        path: ["time"],
        message: "Select a valid time slot.",
      });
      return;
    }
    if (!availableTimeSlots(data.date, now).includes(data.time)) {
      ctx.addIssue({
        code: "custom",
        path: ["time"],
        message: "That time has already passed. Choose another slot.",
      });
    }
  });

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

/** Field groups for each wizard step, used with React Hook Form's trigger(). */
export const BOOKING_STEP_FIELDS = {
  patientDetails: ["fullName", "phone", "email"],
  serviceBranch: ["service", "branch"],
  dateTime: ["date", "time"],
  review: ["consent"],
} as const satisfies Record<string, (keyof BookingRequestInput)[]>;

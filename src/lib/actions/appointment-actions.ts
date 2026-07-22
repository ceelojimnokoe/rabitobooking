"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import {
  getAppointmentById,
  listConfirmedSlots,
  updateAppointment,
  markAppointmentViewed,
  countUnviewedPending,
} from "@/lib/db/appointments";
import { generateAppointmentReference } from "@/lib/reference";
import { hasSlotConflict } from "@/lib/conflicts";
import { isValidTimeSlotForBranch } from "@/lib/scheduling";
import { buildConfirmationEmail, buildRejectionEmail } from "@/lib/email/templates";
import { sendTransactionalEmail } from "@/lib/email/send";
import { branches, teams } from "@/config/clinic";

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Not authorized.");
  }
  return session;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export interface ConfirmAppointmentInput {
  appointmentId: string;
  branch: string;
  date: string;
  time: string;
  assignedTeam?: string;
}

export async function confirmAppointmentAction(
  input: ConfirmAppointmentInput,
): Promise<ActionResult<{ appointmentReference: string; emailStatus: string }>> {
  await requireAdmin();

  if (!branches.some((b) => b.label === input.branch)) {
    return { success: false, error: "Select a valid branch." };
  }
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { success: false, error: "Select a valid date." };
  }
  if (!isValidTimeSlotForBranch(input.time, input.branch, input.date)) {
    return {
      success: false,
      error: "That time isn't available for the selected branch and date.",
    };
  }
  if (input.assignedTeam && !teams.some((t) => t.label === input.assignedTeam)) {
    return { success: false, error: "Select a valid team." };
  }

  const { data: appointment, error: fetchError } = await getAppointmentById(
    input.appointmentId,
  );

  if (fetchError || !appointment) {
    return { success: false, error: "Appointment request not found." };
  }

  const { data: confirmedSlots, error: conflictQueryError } = await listConfirmedSlots(
    input.branch,
    input.date,
    input.time,
  );

  if (conflictQueryError) {
    return { success: false, error: "Couldn't check for scheduling conflicts. Please try again." };
  }

  const conflict = hasSlotConflict(
    confirmedSlots.map((a) => ({
      id: a.id,
      branch: a.confirmed_branch,
      date: a.confirmed_date,
      time: a.confirmed_time,
    })),
    {
      branch: input.branch,
      date: input.date,
      time: input.time,
      excludeId: input.appointmentId,
    },
  );

  if (conflict) {
    return {
      success: false,
      error:
        "That branch, date and time is already booked by another confirmed appointment. Please choose a different time.",
    };
  }

  const appointmentReference = generateAppointmentReference();

  const emailContent = buildConfirmationEmail({
    patientName: appointment.patient_name,
    service: appointment.service,
    branch: input.branch,
    date: input.date,
    time: input.time,
    assignedTeam: input.assignedTeam,
    appointmentReference,
  });

  const emailResult = await sendTransactionalEmail(appointment.email, emailContent);

  const { error: updateError } = await updateAppointment(input.appointmentId, {
    status: "confirmed",
    confirmed_branch: input.branch,
    confirmed_date: input.date,
    confirmed_time: input.time,
    assigned_team: input.assignedTeam || null,
    appointment_reference: appointmentReference,
    confirmed_at: new Date().toISOString(),
    email_status: emailResult.status,
    email_provider_id: emailResult.providerId,
    email_preview: emailResult.preview,
  });

  if (updateError) {
    return { success: false, error: "Couldn't save the confirmation. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${input.appointmentId}`);

  return {
    success: true,
    data: { appointmentReference, emailStatus: emailResult.status },
  };
}

export interface RejectAppointmentInput {
  appointmentId: string;
  reason: string;
}

export async function rejectAppointmentAction(
  input: RejectAppointmentInput,
): Promise<ActionResult<{ emailStatus: string }>> {
  await requireAdmin();

  const reason = input.reason.trim();
  if (!reason) {
    return { success: false, error: "Enter a reason to share with the patient." };
  }

  const { data: appointment, error: fetchError } = await getAppointmentById(
    input.appointmentId,
  );

  if (fetchError || !appointment) {
    return { success: false, error: "Appointment request not found." };
  }

  const emailContent = buildRejectionEmail({
    patientName: appointment.patient_name,
    service: appointment.service,
    date: appointment.requested_date,
    time: appointment.requested_time,
    reason,
    bookingUrl: `${getAppUrl()}/book`,
  });

  const emailResult = await sendTransactionalEmail(appointment.email, emailContent);

  const { error: updateError } = await updateAppointment(input.appointmentId, {
    status: "rejected",
    patient_message: reason,
    email_status: emailResult.status,
    email_provider_id: emailResult.providerId,
    email_preview: emailResult.preview,
  });

  if (updateError) {
    return { success: false, error: "Couldn't save the rejection. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${input.appointmentId}`);

  return { success: true, data: { emailStatus: emailResult.status } };
}

export async function updateInternalNoteAction(
  appointmentId: string,
  note: string,
): Promise<ActionResult> {
  await requireAdmin();

  const { error } = await updateAppointment(appointmentId, {
    internal_note: note.trim() || null,
  });

  if (error) {
    return { success: false, error: "Couldn't save the note. Please try again." };
  }

  revalidatePath(`/admin/appointments/${appointmentId}`);
  return { success: true, data: undefined };
}

/** Marks a request as opened so it stops showing a "New" badge. */
export async function markAppointmentViewedAction(appointmentId: string): Promise<void> {
  await requireAdmin();
  await markAppointmentViewed(appointmentId);
  revalidatePath("/admin");
}

/**
 * Polled by the dashboard to power its new-request notification — how many
 * pending requests no administrator has opened yet.
 */
export async function getPendingUnviewedCountAction(): Promise<number> {
  await requireAdmin();
  const { count } = await countUnviewedPending();
  return count;
}

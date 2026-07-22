export type AppointmentStatus = "pending" | "confirmed" | "rejected" | "cancelled";
export type EmailStatus = "not_sent" | "sent" | "failed" | "preview_only";
export type PatientType = "new" | "existing";

export interface EmailPreviewPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  generatedAt: string;
}

/** Mirrors the public.appointments table. */
export interface AppointmentRow {
  id: string;
  request_reference: string;
  appointment_reference: string | null;

  patient_name: string;
  phone: string;
  email: string;
  patient_type: PatientType;

  service: string;
  requested_branch: string;
  confirmed_branch: string | null;

  requested_date: string; // YYYY-MM-DD
  requested_time: string; // HH:mm
  confirmed_date: string | null;
  confirmed_time: string | null;

  assigned_team: string | null;

  status: AppointmentStatus;

  internal_note: string | null;
  patient_message: string | null;

  email_status: EmailStatus;
  email_provider_id: string | null;
  email_preview: EmailPreviewPayload | null;

  /** When an administrator first opened this request — null until then. */
  viewed_at: string | null;

  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
}

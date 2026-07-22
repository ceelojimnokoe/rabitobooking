import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AppointmentRow,
  AppointmentStatus,
  EmailStatus,
  EmailPreviewPayload,
} from "@/types/appointment";

/**
 * Typed access to the `appointments` table. This is the ONLY module that
 * talks to Supabase for appointment data — see the comment on
 * `createSupabaseAdminClient` for why the client itself is untyped and
 * this module applies explicit types at the boundary instead.
 */

export interface DbError {
  message: string;
  code?: string;
}

const TABLE = "appointments";

export interface AppointmentInsertInput {
  request_reference: string;
  patient_name: string;
  phone: string;
  email: string;
  service: string;
  requested_branch: string;
  requested_date: string;
  requested_time: string;
}

export async function insertAppointmentRequest(
  input: AppointmentInsertInput,
): Promise<{ data: AppointmentRow | null; error: DbError | null }> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, status: "pending", email_status: "not_sent" })
    .select("*")
    .single();

  return { data: (data as AppointmentRow) ?? null, error };
}

export async function getAppointmentById(
  id: string,
): Promise<{ data: AppointmentRow | null; error: DbError | null }> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data: (data as AppointmentRow) ?? null, error };
}

export async function listAppointments(): Promise<{
  data: AppointmentRow[];
  error: DbError | null;
}> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as AppointmentRow[]) ?? [], error };
}

export interface ConfirmedSlot {
  id: string;
  confirmed_branch: string;
  confirmed_date: string;
  confirmed_time: string;
}

export async function listConfirmedSlots(
  branch: string,
  date: string,
  time: string,
): Promise<{ data: ConfirmedSlot[]; error: DbError | null }> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, confirmed_branch, confirmed_date, confirmed_time")
    .eq("status", "confirmed")
    .eq("confirmed_branch", branch)
    .eq("confirmed_date", date)
    .eq("confirmed_time", time);

  return { data: (data as ConfirmedSlot[]) ?? [], error };
}

export interface AppointmentUpdateInput {
  status?: AppointmentStatus;
  confirmed_branch?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  assigned_team?: string | null;
  appointment_reference?: string | null;
  confirmed_at?: string | null;
  internal_note?: string | null;
  patient_message?: string | null;
  email_status?: EmailStatus;
  email_provider_id?: string | null;
  email_preview?: EmailPreviewPayload | null;
}

export async function updateAppointment(
  id: string,
  patch: AppointmentUpdateInput,
): Promise<{ data: AppointmentRow | null; error: DbError | null }> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  return { data: (data as AppointmentRow) ?? null, error };
}

import type { AppointmentRow } from "./appointment";

/** Minimal typed schema for the Supabase client — just what this demo uses. */
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: AppointmentRow;
        Insert: Partial<AppointmentRow> &
          Pick<
            AppointmentRow,
            | "request_reference"
            | "patient_name"
            | "phone"
            | "email"
            | "service"
            | "requested_branch"
            | "requested_date"
            | "requested_time"
          >;
        Update: Partial<AppointmentRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

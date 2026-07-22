import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { listAppointments } from "@/lib/db/appointments";
import { toDateKey } from "@/lib/scheduling";
import { SummaryCards, type SummaryCounts } from "@/components/admin/summary-cards";
import { AppointmentsExplorer } from "@/components/admin/appointments-explorer";
import { NewRequestNotifier } from "@/components/admin/new-request-notifier";
import type { AppointmentRow } from "@/types/appointment";

export const metadata: Metadata = {
  title: "Administrator Dashboard — Rabito Clinic",
};

function computeCounts(appointments: AppointmentRow[]): SummaryCounts {
  const today = toDateKey(new Date());
  return {
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    rejected: appointments.filter((a) => a.status === "rejected").length,
    confirmedToday: appointments.filter(
      (a) => a.status === "confirmed" && a.confirmed_date === today,
    ).length,
  };
}

export default async function AdminDashboardPage() {
  let appointments: AppointmentRow[] = [];
  let loadError: string | null = null;

  try {
    const { data, error } = await listAppointments();
    if (error) throw error;
    appointments = data;
  } catch {
    loadError =
      "We couldn't load appointment requests. Check that Supabase is configured and the migration has been run (see README-DEMO-SETUP.md).";
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/5 p-5"
      >
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-error" aria-hidden="true" />
        <div>
          <p className="font-semibold text-ink">Couldn&apos;t load the dashboard</p>
          <p className="mt-1 text-sm text-muted">{loadError}</p>
        </div>
      </div>
    );
  }

  const unviewedPendingCount = appointments.filter(
    (a) => a.status === "pending" && !a.viewed_at,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <NewRequestNotifier initialCount={unviewedPendingCount} />
      <div>
        <h1 className="text-2xl font-bold text-ink">Appointment requests</h1>
        <p className="mt-1 text-sm text-muted">
          Review pending requests, confirm appointments and manage your
          schedule.
        </p>
      </div>

      <SummaryCards counts={computeCounts(appointments)} />

      <AppointmentsExplorer appointments={appointments} />
    </div>
  );
}

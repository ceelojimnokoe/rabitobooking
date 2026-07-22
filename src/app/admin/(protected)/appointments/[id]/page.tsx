import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAppointmentById, markAppointmentViewed } from "@/lib/db/appointments";
import { formatDateKeyLong, formatTimeLabel } from "@/lib/scheduling";
import { patientTypes } from "@/config/clinic";
import { StatusBadge } from "@/components/ui/badge";
import { AdminActionsPanel } from "@/components/admin/admin-actions-panel";

export const metadata: Metadata = {
  title: "Appointment request — Rabito Clinic Admin",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: appointment, error } = await getAppointmentById(id);

  if (error || !appointment) {
    notFound();
  }

  if (!appointment.viewed_at) {
    await markAppointmentViewed(appointment.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-border-blue bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink">{appointment.patient_name}</h1>
            <p className="mt-1 text-sm text-muted">
              Submitted {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              }).format(new Date(appointment.created_at))}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="Phone" value={appointment.phone} />
          <DetailRow label="Email" value={appointment.email} />
          <DetailRow
            label="Patient type"
            value={
              patientTypes.find((t) => t.id === appointment.patient_type)?.label ??
              appointment.patient_type
            }
          />
          <DetailRow label="Service" value={appointment.service} />
          <DetailRow label="Requested branch" value={appointment.requested_branch} />
          <DetailRow
            label="Requested date"
            value={formatDateKeyLong(appointment.requested_date)}
          />
          <DetailRow
            label="Requested time"
            value={formatTimeLabel(appointment.requested_time)}
          />
          <DetailRow label="Request reference" value={appointment.request_reference} />
          {appointment.appointment_reference ? (
            <DetailRow
              label="Appointment reference"
              value={appointment.appointment_reference}
            />
          ) : null}
          {appointment.status === "confirmed" && appointment.confirmed_date ? (
            <>
              <DetailRow
                label="Confirmed branch"
                value={appointment.confirmed_branch ?? ""}
              />
              <DetailRow
                label="Confirmed date"
                value={formatDateKeyLong(appointment.confirmed_date)}
              />
              <DetailRow
                label="Confirmed time"
                value={formatTimeLabel(appointment.confirmed_time ?? "")}
              />
              {appointment.assigned_team ? (
                <DetailRow label="Assigned team" value={appointment.assigned_team} />
              ) : null}
            </>
          ) : null}
          {appointment.status === "rejected" && appointment.patient_message ? (
            <DetailRow
              label="Reason shared with patient"
              value={appointment.patient_message}
            />
          ) : null}
        </dl>
      </div>

      <AdminActionsPanel appointment={appointment} />
    </div>
  );
}

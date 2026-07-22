import type { AppointmentStatus } from "@/types/appointment";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  confirmed: "bg-success/10 text-success border-success/30",
  rejected: "bg-error/10 text-error border-error/30",
  cancelled: "bg-muted/10 text-muted border-muted/30",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-navy/30 bg-navy/5 px-2.5 py-1 text-xs font-semibold text-navy">
      Coming Soon
    </span>
  );
}

import { Clock, CheckCircle2, XCircle, CalendarCheck } from "lucide-react";

export interface SummaryCounts {
  pending: number;
  confirmed: number;
  rejected: number;
  confirmedToday: number;
}

const CARDS = [
  {
    key: "pending" as const,
    label: "Pending requests",
    icon: Clock,
    accent: "text-warning",
  },
  {
    key: "confirmed" as const,
    label: "Confirmed appointments",
    icon: CheckCircle2,
    accent: "text-success",
  },
  {
    key: "rejected" as const,
    label: "Rejected requests",
    icon: XCircle,
    accent: "text-error",
  },
  {
    key: "confirmedToday" as const,
    label: "Today's confirmed appointments",
    icon: CalendarCheck,
    accent: "text-navy",
  },
];

export function SummaryCards({ counts }: { counts: SummaryCounts }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, accent }) => (
        <div
          key={key}
          className="rounded-xl border border-border-blue bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">{label}</p>
            <Icon className={`size-5 ${accent}`} aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-bold text-ink">{counts[key]}</p>
        </div>
      ))}
    </div>
  );
}

import Link from "next/link";

export default function AppointmentNotFound() {
  return (
    <div className="rounded-xl border border-border-blue bg-white p-10 text-center">
      <p className="text-lg font-semibold text-ink">Appointment request not found</p>
      <p className="mt-1 text-sm text-muted">
        It may have been removed, or the link is incorrect.
      </p>
      <Link
        href="/admin"
        className="mt-4 inline-block text-sm font-semibold text-navy hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

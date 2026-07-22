import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function BookingSuccess({ reference }: { reference: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <CheckCircle2 className="size-14 text-success" aria-hidden="true" />
      <div>
        <h2 className="text-xl font-bold text-ink">Request submitted</h2>
        <p className="mt-2 text-sm text-muted">
          Thank you — your appointment request has been received and is
          being reviewed by our clinic team.
        </p>
      </div>

      <div className="w-full rounded-lg border border-border-blue bg-pale p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Request reference
        </p>
        <p className="mt-1 text-2xl font-bold tracking-wide text-navy">
          {reference}
        </p>
      </div>

      <p className="text-sm text-muted">
        This is not yet a confirmed appointment. Once reviewed, we&apos;ll
        email you the final date, time and branch — please keep an eye on
        your inbox.
      </p>

      <Link href="/" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
        Return to homepage
      </Link>
    </div>
  );
}

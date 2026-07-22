import Link from "next/link";
import { clinicIdentity } from "@/config/clinic";
import { buttonClasses } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-blue bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-navy"
        >
          <span className="text-lg font-bold text-navy">
            {clinicIdentity.shortName}
          </span>
          <span className="hidden text-sm font-medium text-muted sm:inline">
            Clinic
          </span>
        </Link>
        <Link href="/book" className={buttonClasses("primary", "md")}>
          Book an Appointment
        </Link>
      </div>
    </header>
  );
}

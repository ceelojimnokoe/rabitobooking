import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { clinicIdentity } from "@/config/clinic";

export function Hero() {
  return (
    <section className="border-b border-border-blue bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy">
            {clinicIdentity.name}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink sm:text-5xl">
            {clinicIdentity.tagline}
          </h1>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Request an appointment in a few simple steps and receive
            confirmation by email once our clinic team has reviewed your
            preferred date and time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
            >
              Book an Appointment
            </Link>
            <a
              href="#services"
              className={buttonClasses("secondary", "lg", "w-full sm:w-auto")}
            >
              View Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

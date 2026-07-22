import { services } from "@/config/clinic";
import { Stethoscope } from "lucide-react";

export function ServicesSection() {
  return (
    <section id="services" className="border-y border-border-blue bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">
            Our services
          </h2>
          <p className="mt-2 text-muted">
            Choose the service you need when you start your booking request.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-xl border border-border-blue bg-pale p-5"
            >
              <Stethoscope className="size-6 text-navy" aria-hidden="true" />
              <p className="mt-3 font-semibold text-ink">{service.label}</p>
              <p className="mt-1 text-sm text-muted">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

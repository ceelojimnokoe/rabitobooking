"use client";

import { comingSoonFeatures } from "@/config/clinic";
import { FeatureIconComponent } from "@/components/icons";
import { ComingSoonBadge } from "@/components/ui/badge";
import { useToast } from "@/components/toast-provider";

export function ComingSoonSection() {
  const { showToast } = useToast();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          Proposed future platform
        </h2>
        <p className="mt-2 text-muted">
          These capabilities are part of the proposed Rabito Clinic
          platform and are not active in this demonstration yet.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {comingSoonFeatures.map((feature) => (
          <button
            key={feature.title}
            type="button"
            onClick={() =>
              showToast(
                `${feature.title} is part of the proposed future platform and isn't active in this demo.`,
                "info",
              )
            }
            className="flex flex-col items-start gap-3 rounded-xl border border-border-blue bg-white p-5 text-left opacity-75 shadow-sm transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <div className="flex w-full items-center justify-between">
              <FeatureIconComponent
                icon={feature.icon}
                className="size-6 text-navy"
              />
              <ComingSoonBadge />
            </div>
            <p className="font-semibold text-ink">{feature.title}</p>
            <p className="text-sm text-muted">{feature.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

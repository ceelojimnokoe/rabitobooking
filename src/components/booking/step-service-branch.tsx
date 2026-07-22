import { useFormContext } from "react-hook-form";
import {
  services,
  branches,
  onlineServiceId,
  recommendedOnlineBranchId,
} from "@/config/clinic";
import type { BookingRequestInput } from "@/lib/validation/booking";
import { Field } from "./field";

const onlineServiceLabel = services.find((s) => s.id === onlineServiceId)!.label;
const recommendedBranchLabel = branches.find(
  (b) => b.id === recommendedOnlineBranchId,
)!.label;

export function StepServiceBranch() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingRequestInput>();

  const selectedService = watch("service");
  const isOnlineService = selectedService === onlineServiceLabel;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-ink">Service &amp; branch</h2>
        <p className="mt-1 text-sm text-muted">
          Choose the service you need and where you&apos;d like to be seen.
        </p>
      </div>

      <Field id="service" label="Service" error={errors.service?.message}>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label
              key={service.id}
              className="peer relative flex cursor-pointer flex-col gap-1 rounded-lg border border-border-blue bg-white p-3.5 has-checked:border-navy has-checked:bg-pale has-checked:ring-1 has-checked:ring-navy"
            >
              <input
                type="radio"
                value={service.label}
                className="sr-only"
                {...register("service", {
                  onChange: (event) => {
                    if (event.target.value === onlineServiceLabel) {
                      setValue("branch", recommendedBranchLabel, {
                        shouldValidate: true,
                      });
                    }
                  },
                })}
              />
              <span className="text-sm font-semibold text-ink">
                {service.label}
              </span>
              <span className="text-xs text-muted">{service.description}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field id="branch" label="Branch" error={errors.branch?.message}>
        <div className="grid gap-2 sm:grid-cols-2">
          {branches.map((branch) => {
            const isRecommended =
              isOnlineService && branch.id === recommendedOnlineBranchId;
            return (
              <label
                key={branch.id}
                className="relative flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border-blue bg-white p-3.5 has-checked:border-navy has-checked:bg-pale has-checked:ring-1 has-checked:ring-navy"
              >
                <input
                  type="radio"
                  value={branch.label}
                  className="sr-only"
                  {...register("branch")}
                />
                <span className="text-sm font-semibold text-ink">
                  {branch.label}
                </span>
                {isRecommended ? (
                  <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-semibold text-navy">
                    Recommended
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

import { useFormContext } from "react-hook-form";
import type { BookingRequestInput } from "@/lib/validation/booking";
import { Field, fieldInputClasses } from "./field";

export function StepPatientDetails() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingRequestInput>();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-ink">Your details</h2>
        <p className="mt-1 text-sm text-muted">
          Tell us how the clinic can reach you about this request.
        </p>
      </div>

      <Field id="fullName" label="Full name" error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className={fieldInputClasses}
          aria-invalid={errors.fullName ? "true" : "false"}
          aria-describedby="fullName-error"
          {...register("fullName")}
        />
      </Field>

      <Field
        id="phone"
        label="Contact number"
        hint="e.g. 024 123 4567 or +233 24 123 4567"
        error={errors.phone?.message}
      >
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={fieldInputClasses}
          aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby="phone-hint phone-error"
          {...register("phone")}
        />
      </Field>

      <Field id="email" label="Email address" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className={fieldInputClasses}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby="email-error"
          {...register("email")}
        />
      </Field>

      {/* Honeypot: hidden from real users, tempting for simple bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="companyWebsite">Company website</label>
        <input
          id="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("companyWebsite")}
        />
      </div>
    </div>
  );
}

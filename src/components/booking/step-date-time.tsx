"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarClock } from "lucide-react";
import type { BookingRequestInput } from "@/lib/validation/booking";
import {
  toDateKey,
  availableTimeSlots,
  validateDateKey,
  formatTimeLabel,
} from "@/lib/scheduling";
import { scheduling } from "@/config/clinic";
import { Field } from "./field";

function DateTimeSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-5 w-40 animate-pulse rounded bg-border-blue" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-border-blue" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-border-blue" />
        ))}
      </div>
    </div>
  );
}

export function StepDateTime() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BookingRequestInput>();

  // Computed only after mount so the server-rendered/first-hydration pass
  // never depends on "now" (avoids hydration mismatches from unstable
  // dates). Until then we show a skeleton loader.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Intentional exception to react-hooks/set-state-in-effect: this reads
    // the client's true current time, which must not run during the
    // server-rendered/first-hydration pass (see comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  const dateValue = watch("date");
  const timeValue = watch("time");

  if (!now) {
    return <DateTimeSkeleton />;
  }

  const minDate = toDateKey(now);
  const maxDate = toDateKey(
    new Date(now.getTime() + scheduling.bookingWindowDays * 86_400_000),
  );

  const dateValidation = dateValue ? validateDateKey(dateValue, now) : null;
  const slots =
    dateValue && dateValidation?.ok ? availableTimeSlots(dateValue, now) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-ink">Date &amp; time</h2>
        <p className="mt-1 text-sm text-muted">
          Choose your preferred date and time. The clinic is closed Sundays.
        </p>
      </div>

      <Field
        id="date"
        label="Preferred date"
        error={errors.date?.message ?? (dateValidation?.ok === false ? dateValidation.reason : undefined)}
      >
        <input
          id="date"
          type="date"
          min={minDate}
          max={maxDate}
          className="min-h-11 w-full rounded-lg border border-border-blue bg-white px-3.5 py-2.5 text-base text-ink focus:border-navy focus:outline-none focus-visible:outline-2 focus-visible:outline-navy"
          aria-invalid={errors.date ? "true" : "false"}
          aria-describedby="date-error"
          {...register("date", {
            onChange: () => setValue("time", "", { shouldValidate: false }),
          })}
        />
      </Field>

      {dateValue && dateValidation?.ok ? (
        <Field id="time" label="Preferred time" error={errors.time?.message}>
          {slots.length === 0 ? (
            <p className="text-sm text-muted">
              No remaining time slots for this date. Please choose another
              date.
            </p>
          ) : (
            <div
              role="group"
              aria-labelledby="time-label"
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
            >
              {slots.map((slot) => {
                const selected = timeValue === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setValue("time", slot, { shouldValidate: true })
                    }
                    className={`min-h-11 rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors ${
                      selected
                        ? "border-navy bg-navy text-white"
                        : "border-border-blue bg-white text-ink hover:border-navy"
                    }`}
                  >
                    {formatTimeLabel(slot)}
                  </button>
                );
              })}
            </div>
          )}
          <input type="hidden" {...register("time")} />
        </Field>
      ) : null}

      <div className="flex items-start gap-2.5 rounded-lg border border-border-blue bg-pale p-3.5">
        <CalendarClock className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden="true" />
        <p className="text-xs text-muted">
          Your chosen date and time are a <strong>request</strong>. The
          clinic will confirm the exact appointment — either as requested or
          with an adjusted date, time or branch — by email.
        </p>
      </div>
    </div>
  );
}

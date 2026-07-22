"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import {
  bookingRequestSchema,
  BOOKING_STEP_FIELDS,
  type BookingRequestInput,
} from "@/lib/validation/booking";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import { StepPatientDetails } from "./step-patient-details";
import { StepServiceBranch } from "./step-service-branch";
import { StepDateTime } from "./step-date-time";
import { StepReview } from "./step-review";
import { BookingSuccess } from "./booking-success";

const STEP_KEYS = [
  "patientDetails",
  "serviceBranch",
  "dateTime",
  "review",
] as const;

const defaultValues: BookingRequestInput = {
  fullName: "",
  phone: "",
  email: "",
  patientType: "" as BookingRequestInput["patientType"],
  service: "" as BookingRequestInput["service"],
  branch: "" as BookingRequestInput["branch"],
  date: "",
  time: "",
  consent: false as unknown as true,
  companyWebsite: "",
};

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BookingRequestInput>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { trigger, handleSubmit, setError } = methods;

  async function handleNext() {
    const fields = BOOKING_STEP_FIELDS[STEP_KEYS[step]];
    const valid = await trigger(fields);
    if (valid) {
      setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
    }
  }

  function handleBack() {
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: BookingRequestInput) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (payload.fieldErrors) {
          for (const [field, messages] of Object.entries<string[]>(
            payload.fieldErrors,
          )) {
            if (messages?.[0]) {
              setError(field as keyof BookingRequestInput, {
                message: messages[0],
              });
            }
          }
        }
        setSubmitError(
          payload.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      setReference(payload.reference);
    } catch {
      setSubmitError(
        "We couldn't reach the server. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (reference) {
    return <BookingSuccess reference={reference} />;
  }

  const isLastStep = step === STEP_KEYS.length - 1;

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6">
        <StepIndicator step={step} />

        <form
          onSubmit={isLastStep ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
          noValidate
        >
          {step === 0 && <StepPatientDetails />}
          {step === 1 && <StepServiceBranch />}
          {step === 2 && <StepDateTime />}
          {step === 3 && <StepReview goToStep={setStep} />}

          {submitError ? (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-lg border border-error/30 bg-error/5 p-3.5"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-error"
                aria-hidden="true"
              />
              <p className="text-sm text-error">{submitError}</p>
            </div>
          ) : null}

          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleBack}
                className="flex-1 sm:flex-none"
              >
                Back
              </Button>
            ) : null}

            {!isLastStep ? (
              <Button
                key="continue"
                type="button"
                size="lg"
                onClick={handleNext}
                className="flex-1 sm:flex-none"
              >
                Continue
              </Button>
            ) : (
              <Button
                key="submit"
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? "Submitting..." : "Submit request"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

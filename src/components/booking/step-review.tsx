import { useFormContext } from "react-hook-form";
import type { BookingRequestInput } from "@/lib/validation/booking";
import { formatDateKeyLong, formatTimeLabel } from "@/lib/scheduling";

const STEP_PATIENT_DETAILS = 0;
const STEP_SERVICE_BRANCH = 1;
const STEP_DATE_TIME = 2;

interface ReviewRowProps {
  label: string;
  value: string;
  onEdit: () => void;
}

function ReviewRow({ label, value, onEdit }: ReviewRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border-blue py-3 last:border-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-sm font-semibold text-navy hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

export function StepReview({ goToStep }: { goToStep: (step: number) => void }) {
  const {
    register,
    getValues,
    formState: { errors, isSubmitted },
  } = useFormContext<BookingRequestInput>();

  // Consent is only registered once this step first mounts, so avoid
  // surfacing its "required" error until the patient has actually tried
  // to submit — otherwise it would flash on arrival, before any interaction.
  const consentError = isSubmitted ? errors.consent?.message : undefined;

  const values = getValues();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-ink">Review your request</h2>
        <p className="mt-1 text-sm text-muted">
          Please check your details before submitting.
        </p>
      </div>

      <div className="rounded-lg border border-border-blue bg-white p-4">
        <ReviewRow
          label="Full name"
          value={values.fullName}
          onEdit={() => goToStep(STEP_PATIENT_DETAILS)}
        />
        <ReviewRow
          label="Phone"
          value={values.phone}
          onEdit={() => goToStep(STEP_PATIENT_DETAILS)}
        />
        <ReviewRow
          label="Email"
          value={values.email}
          onEdit={() => goToStep(STEP_PATIENT_DETAILS)}
        />
        <ReviewRow
          label="Service"
          value={values.service}
          onEdit={() => goToStep(STEP_SERVICE_BRANCH)}
        />
        <ReviewRow
          label="Branch"
          value={values.branch}
          onEdit={() => goToStep(STEP_SERVICE_BRANCH)}
        />
        <ReviewRow
          label="Preferred date"
          value={formatDateKeyLong(values.date)}
          onEdit={() => goToStep(STEP_DATE_TIME)}
        />
        <ReviewRow
          label="Preferred time"
          value={formatTimeLabel(values.time)}
          onEdit={() => goToStep(STEP_DATE_TIME)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 rounded border-border-blue text-navy focus-visible:outline-2 focus-visible:outline-navy"
            aria-invalid={consentError ? "true" : "false"}
            aria-describedby="consent-error"
            {...register("consent")}
          />
          <span>
            I consent to Rabito Clinic using these details to process and
            respond to my appointment request.
          </span>
        </label>
        <p
          id="consent-error"
          role="alert"
          className={`text-xs font-medium text-error ${consentError ? "" : "invisible"}`}
        >
          {consentError || "placeholder"}
        </p>
      </div>
    </div>
  );
}

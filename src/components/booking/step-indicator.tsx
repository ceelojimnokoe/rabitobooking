const STEP_LABELS = [
  "Your details",
  "Service & branch",
  "Date & time",
  "Review & submit",
];

export function StepIndicator({ step }: { step: number }) {
  return (
    <div aria-label={`Step ${step + 1} of ${STEP_LABELS.length}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span>
          Step {step + 1} of {STEP_LABELS.length}
        </span>
        <span className="text-navy">{STEP_LABELS[step]}</span>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {STEP_LABELS.map((label, index) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full ${
              index <= step ? "bg-navy" : "bg-border-blue"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

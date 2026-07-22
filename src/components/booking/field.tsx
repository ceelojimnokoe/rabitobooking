import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ id, label, error, hint, children }: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      <p
        id={errorId}
        role="alert"
        className={`min-h-4 text-xs font-medium text-error ${error ? "" : "invisible"}`}
      >
        {error || "placeholder"}
      </p>
    </div>
  );
}

export const fieldInputClasses =
  "min-h-11 w-full rounded-lg border border-border-blue bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted focus:border-navy focus:outline-none focus-visible:outline-2 focus-visible:outline-navy";

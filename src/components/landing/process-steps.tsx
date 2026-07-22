import { processSteps } from "@/config/clinic";
import { ProcessStepIconComponent } from "@/components/icons";

export function ProcessSteps() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          How booking works
        </h2>
        <p className="mt-2 text-muted">
          A short, five-step process from request to confirmation.
        </p>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {processSteps.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col gap-3 rounded-xl border border-border-blue bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                {index + 1}
              </span>
              <ProcessStepIconComponent
                icon={step.icon}
                className="size-5 text-navy"
              />
            </div>
            <div>
              <p className="font-semibold text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

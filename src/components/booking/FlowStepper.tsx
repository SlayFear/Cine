interface FlowStepperProps {
  current: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "FUNCIÓN" },
  { n: 2, label: "ASIENTO" },
  { n: 3, label: "CONFIRMACIÓN" },
] as const;

export default function FlowStepper({ current }: FlowStepperProps) {
  return (
    <ol className="flex items-center gap-2.5">
      {STEPS.map((step, i) => {
        const reached = step.n <= current;
        const active = step.n === current;

        return (
          <li key={step.n} className="flex items-center gap-2.5">
            {i > 0 && (
              <div
                className={`h-0 w-6 border-t sm:w-8 ${
                  step.n <= current ? "border-cine-red" : "border-dashed border-cine-border"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  reached
                    ? "border-cine-red bg-cine-red text-cine-text"
                    : "border-cine-border text-cine-muted"
                }`}
              >
                {step.n}
              </span>
              <span
                className={`hidden text-[11px] font-bold tracking-[0.15em] sm:inline ${
                  active ? "text-cine-red" : reached ? "text-cine-text" : "text-cine-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

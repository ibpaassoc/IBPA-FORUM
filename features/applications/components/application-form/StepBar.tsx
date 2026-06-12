import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

export type StepDef = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export default function StepBar({
  steps,
  current,
}: {
  steps: StepDef[];
  current: number;
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-3xl px-4">
      <div className="flex items-center justify-between rounded-full bg-white/90 px-4 py-3 shadow-[0_4px_24px_rgba(3,2,19,0.08)] backdrop-blur-sm">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Step pill */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    done
                      ? "bg-[var(--color-hover-accent)] text-white"
                      : active
                        ? "bg-[var(--color-ink)] text-white shadow-[0_2px_8px_rgba(3,2,19,0.25)]"
                        : "bg-[var(--surface-muted)] text-[var(--color-ink)]/30"
                  }`}
                >
                  {done ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <Icon size={15} strokeWidth={1.8} />
                  )}
                </div>
                <span
                  className={`hidden text-[0.55rem] font-semibold uppercase tracking-[0.1em] sm:block ${
                    active ? "text-[var(--color-ink)]" : done ? "text-[var(--color-hover-accent)]" : "text-[var(--color-ink)]/35"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < steps.length - 1 ? (
                <div
                  className={`mx-1 h-px flex-shrink-0 w-4 transition-colors duration-500 sm:w-6 ${
                    i < current ? "bg-[var(--color-hover-accent)]/40" : "bg-[var(--border-default)]"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

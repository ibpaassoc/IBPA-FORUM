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
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="flex items-center justify-between rounded-[40px] bg-white/90 px-6 py-4 shadow-xl backdrop-blur-xl border border-slate-100 overflow-x-auto no-scrollbar gap-2">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.id} className="flex flex-1 items-center min-w-0">
              {/* Step pill */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    done
                      ? "bg-[var(--color-hover-accent)] text-white"
                      : active
                        ? "bg-[var(--color-ink)] text-white shadow-lg scale-110"
                        : "bg-slate-100 text-slate-300"
                  }`}
                >
                  {done ? (
                    <Check size={15} strokeWidth={2.5} />
                  ) : (
                    <Icon size={16} strokeWidth={1.8} />
                  )}
                </div>
                <span
                  className={`hidden text-[0.55rem] font-bold uppercase tracking-[0.14em] sm:block whitespace-nowrap ${
                    active ? "text-[var(--color-ink)]" : done ? "text-[var(--color-hover-accent)]" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < steps.length - 1 ? (
                <div
                  className={`mx-1 h-px w-4 shrink-0 transition-colors duration-500 sm:w-6 ${
                    i < current ? "bg-[var(--color-hover-accent)]/50" : "bg-slate-200"
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

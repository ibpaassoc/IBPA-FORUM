import type { LucideIcon } from "lucide-react";
import { Check, Lock } from "lucide-react";

export type StepDef = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export default function StepBar({
  steps,
  current,
  maxUnlockedStep = current,
  onStepChange,
}: {
  steps: StepDef[];
  current: number;
  maxUnlockedStep?: number;
  onStepChange?: (stepIndex: number) => void;
}) {
  return (
    <div className="mx-auto w-full">
      <div className="overflow-x-auto no-scrollbar rounded-[24px] border border-white/90 bg-white/66 px-3 py-3 shadow-[0_14px_42px_rgba(55,92,118,0.08)] backdrop-blur-2xl sm:px-5 sm:py-4">
        <div className="flex min-w-max items-center justify-center">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const done = i < current;
            const active = i === current;
            const unlocked = i <= maxUnlockedStep;
            const clickable = unlocked && Boolean(onStepChange);

            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (clickable) onStepChange?.(i);
                  }}
                  className={`group flex min-w-[78px] flex-col items-center gap-2 rounded-2xl px-2 py-1 transition duration-300 sm:min-w-[108px] lg:min-w-[132px] ${
                    clickable
                      ? "cursor-pointer hover:-translate-y-0.5"
                      : "cursor-not-allowed opacity-45"
                  }`}
                >
                  <span
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition duration-300 sm:h-10 sm:w-10 ${
                      done
                        ? "border-[var(--color-blue)]/35 bg-[var(--color-blue-wash)] text-[var(--color-blue)]"
                        : active
                          ? "scale-[1.06] border-[#5689ad] bg-[#5689ad] text-white shadow-[0_0_0_5px_rgba(185,217,235,0.32),0_8px_24px_rgba(86,137,173,0.32)]"
                          : unlocked
                            ? "border-transparent bg-[var(--surface-tint)] text-[var(--color-ink-soft)] group-hover:border-[var(--color-blue)]/25 group-hover:bg-[var(--color-blue-wash)]"
                            : "border-transparent bg-[var(--surface-tint)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    {done ? (
                      <Check size={15} strokeWidth={2.4} />
                    ) : unlocked ? (
                      <Icon size={16} strokeWidth={1.65} />
                    ) : (
                      <Lock size={14} strokeWidth={1.6} />
                    )}
                  </span>

                  <span
                    className={`text-[0.56rem] font-bold uppercase tracking-[0.15em] sm:text-[0.6rem] ${
                      active
                        ? "text-[var(--color-ink)]"
                        : done
                          ? "text-[var(--color-blue)]"
                          : "text-[var(--color-ink-soft)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>

                {i < steps.length - 1 ? (
                  <div
                    className={`h-px w-5 shrink-0 sm:w-8 lg:w-10 ${
                      i < current
                        ? "bg-[var(--color-blue)]/45"
                        : "bg-[var(--border-soft)]"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

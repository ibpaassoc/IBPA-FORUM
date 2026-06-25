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
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="overflow-x-auto no-scrollbar rounded-[40px] border border-[var(--color-blue)]/15 bg-white/78 px-4 py-3 shadow-[0_14px_44px_rgba(42,66,82,0.07)] backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="flex min-w-max items-center justify-center gap-2 sm:gap-3">
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
                  className={`group flex min-w-[72px] flex-col items-center gap-1.5 rounded-2xl px-2 py-1.5 transition duration-200 sm:min-w-[86px] ${
                    clickable
                      ? "cursor-pointer hover:-translate-y-0.5"
                      : "cursor-not-allowed opacity-45"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition duration-200 sm:h-10 sm:w-10 ${
                      done
                        ? "border-[var(--color-blue)]/35 bg-[var(--color-blue-wash)] text-[var(--color-blue)]"
                        : active
                          ? "scale-[1.04] border-[var(--color-blue)] bg-white text-[var(--color-ink)] shadow-[0_8px_22px_rgba(122,152,175,0.14)]"
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
                    className={`text-[0.56rem] font-bold uppercase tracking-[0.16em] sm:text-[0.6rem] ${
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
                    className={`mx-1 h-px w-4 shrink-0 sm:mx-2 sm:w-6 ${
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

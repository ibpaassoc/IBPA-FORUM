"use client";

import clsx from "clsx";
import FadeUp from "./FadeUp";

type FormProgressStep = {
  id: string;
  label: string;
  hint?: string;
  complete?: boolean;
};

type FormProgressSidebarProps = {
  title: string;
  subtitle?: string;
  progressLabel: string;
  progressValue: number;
  steps: FormProgressStep[];
  className?: string;
};

export default function FormProgressSidebar({
  title,
  subtitle,
  progressLabel,
  progressValue,
  steps,
  className,
}: FormProgressSidebarProps) {
  return (
    <FadeUp
      className={clsx(
        "page-card rounded-[var(--radius)] p-[var(--space-md)] lg:sticky lg:top-[110px]",
        className
      )}
    >
      <h2 className="text-[clamp(1.2rem,1.8vw,1.6rem)] leading-[1.2] text-[var(--color-ink)]">{title}</h2>
      {subtitle ? <p className="mt-[var(--space-xs)] text-sm leading-[1.7] text-[var(--color-ink-soft)]">{subtitle}</p> : null}
      <div className="mt-[var(--space-md)]">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-[var(--color-hover-accent)]">
          <span>{progressLabel}</span>
          <span>{Math.max(0, Math.min(100, progressValue))}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[var(--color-mist)]">
          <div
            className="h-2 rounded-full bg-[var(--color-hover-accent)] transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, progressValue))}%` }}
          />
        </div>
      </div>
      <ol className="mt-[var(--space-md)] space-y-3">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-start gap-3">
            <span
              className={clsx(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.68rem] font-medium",
                step.complete
                  ? "border-[var(--border-strong)] bg-[var(--surface-tint)] text-[var(--color-hover-accent)]"
                  : "border-[var(--border-default)] bg-[var(--surface)] text-[var(--color-ink-soft)]"
              )}
            >
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-[var(--color-ink)]">{step.label}</span>
              {step.hint ? <span className="block text-xs leading-5 text-[var(--color-ink-soft)]">{step.hint}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </FadeUp>
  );
}

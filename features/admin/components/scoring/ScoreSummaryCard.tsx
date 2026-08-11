import type { ComponentType, ReactNode } from "react";
import clsx from "clsx";
import { GlassCard } from "@/shared/components/admin/DashboardUI";

type IconType = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const toneClasses = {
  neutral: "bg-white text-[var(--color-ink-soft)]",
  blue: "bg-[var(--color-blue-wash)] text-[var(--color-blue)]",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-[rgba(114,160,193,0.12)] text-[var(--color-blue)]",
} as const;

/**
 * Плитка сводки аудита оценок: подпись, крупное значение и пояснение снизу.
 * Отличается от `MetricCard` тем, что значение может быть составным
 * («8.2 / 100», бейдж статуса) и всегда есть строка контекста.
 */
export default function ScoreSummaryCard({
  label,
  value,
  suffix,
  detail,
  icon: Icon,
  tone = "blue",
  className,
}: {
  label: string;
  value: ReactNode;
  /** Приписка рядом со значением — например «/ 100» или «/ 56». */
  suffix?: ReactNode;
  detail?: ReactNode;
  icon?: IconType;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <GlassCard className={clsx("flex flex-col justify-between p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.62rem] font-semibold uppercase leading-[1.35] tracking-[0.16em] text-[var(--color-ink-soft)]">
          {label}
        </p>
        {Icon ? (
          <span
            className={clsx(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              toneClasses[tone],
            )}
          >
            <Icon aria-hidden size={16} strokeWidth={1.8} />
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
        <span className="font-[var(--font-title-family)] text-[clamp(1.9rem,3.4vw,2.6rem)] font-light leading-none tracking-[-0.035em] text-[var(--color-ink)]">
          {value}
        </span>
        {suffix ? (
          <span className="text-[0.9rem] font-light text-[var(--color-ink-muted)]">{suffix}</span>
        ) : null}
      </div>

      {detail ? (
        <div className="mt-3 text-[0.76rem] leading-[1.5] text-[var(--color-ink-soft)]">
          {detail}
        </div>
      ) : null}
    </GlassCard>
  );
}

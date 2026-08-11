import clsx from "clsx";

/**
 * Прогресс жюри по номинации: подпись, доля и полоса.
 * Полоса меняет цвет по завершённости, чтобы отстающие номинации читались
 * в списке без чтения цифр.
 */
export default function ScoreProgress({
  percentage,
  label,
  hint,
  className,
}: {
  percentage: number;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(Math.round(percentage), 100));
  const barTone =
    clamped >= 100
      ? "bg-emerald-500/80"
      : clamped === 0
        ? "bg-[rgba(3,2,19,0.16)]"
        : "bg-[var(--color-blue)]";

  return (
    <div className={clsx("w-full", className)}>
      {label || hint ? (
        <div className="flex items-center justify-between gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          {label ? <span className="truncate">{label}</span> : <span />}
          {hint ? <span className="shrink-0">{hint}</span> : null}
        </div>
      ) : null}
      <div
        className={clsx(
          "h-1.5 overflow-hidden rounded-full bg-[rgba(3,2,19,0.07)]",
          label || hint ? "mt-1.5" : null,
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={clsx("h-full rounded-full transition-all duration-500", barTone)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

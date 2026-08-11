import clsx from "clsx";
import { adminT } from "@/lib/i18n/admin";
import type { ScoringCriterion } from "@/features/jury/scoring/category-scoring";

/** Русская подпись критерия из словаря админки; запасной вариант — из схемы. */
export function criterionLabel(criterion: ScoringCriterion) {
  return adminT.scoring.criteriaLabels[criterion.key] ?? criterion.label;
}

export function criterionShortLabel(criterion: ScoringCriterion) {
  return adminT.scoring.criteriaShortLabels[criterion.key] ?? criterionLabel(criterion);
}

/**
 * Сетка баллов по критериям регламента.
 * Незаполненные критерии показываются как «—», чтобы было видно, что именно
 * судья ещё не оценил, а не только итог.
 */
export default function CriteriaScoreGrid({
  criteria,
  scores,
  className,
}: {
  criteria: ScoringCriterion[];
  scores: Record<string, number | null>;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7",
        className,
      )}
    >
      {criteria.map((criterion) => {
        const value = scores[criterion.key];
        const isFilled = typeof value === "number";

        return (
          <div
            key={criterion.key}
            title={criterionLabel(criterion)}
            className={clsx(
              "rounded-[16px] border px-2 py-2.5 text-center",
              isFilled
                ? "border-[rgba(37,42,45,0.08)] bg-white/72"
                : "border-dashed border-[rgba(37,42,45,0.12)] bg-white/40",
            )}
          >
            <p className="line-clamp-2 min-h-[2.4em] break-words text-[0.6rem] font-medium leading-[1.2] text-[var(--color-ink-muted)]">
              {criterionShortLabel(criterion)}
            </p>
            <p
              className={clsx(
                "mt-1.5 font-[var(--font-title-family)] text-[1.05rem] font-light leading-none tracking-[-0.02em]",
                isFilled ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]",
              )}
            >
              {isFilled ? value : "—"}
              <span className="text-[0.72rem] text-[var(--color-ink-muted)]">
                {" "}
                / {criterion.maxScore}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

import { adminT } from "@/lib/i18n/admin";
import type { CriterionAverage } from "@/features/admin/lib/scoring-metrics";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { criterionLabel } from "@/features/admin/components/scoring/CriteriaScoreGrid";
import { DashboardCard } from "@/shared/components/admin/DashboardUI";

/**
 * Средний балл по каждому критерию среди отправленных отзывов.
 * Полоса показывает долю от максимума критерия, поэтому критерии с разным
 * весом сравнимы между собой.
 */
export default function CriteriaAverageChart({
  criteriaAverages,
  scoringDefinition,
  submittedCount,
  assignedCount,
}: {
  criteriaAverages: CriterionAverage[];
  scoringDefinition: NominationScoringDefinition;
  submittedCount: number;
  assignedCount: number;
}) {
  const criteriaByKey = new Map(
    scoringDefinition.criteria.map((criterion) => [criterion.key, criterion]),
  );

  return (
    <DashboardCard className="rounded-[26px]">
      <h3 className="font-[var(--font-title-family)] text-[1.15rem] font-light tracking-[-0.02em] text-[var(--color-ink)]">
        {adminT.scoring.analyticsCriteriaAverages}
      </h3>

      {submittedCount === 0 ? (
        <p className="mt-4 text-[0.82rem] leading-[1.55] text-[var(--color-ink-soft)]">
          {adminT.scoring.analyticsEmpty}
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {criteriaAverages.map((item) => {
              const criterion = criteriaByKey.get(item.key);
              if (!criterion) return null;

              return (
                <li key={item.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 flex-1 break-words text-[0.78rem] leading-[1.35] text-[var(--color-ink-soft)]">
                      {criterionLabel(criterion)}
                    </span>
                    <span className="shrink-0 text-[0.78rem] font-medium text-[var(--color-ink)]">
                      {item.average === null ? "—" : item.average.toFixed(1)}
                      <span className="text-[var(--color-ink-muted)]"> / {item.maxScore}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(3,2,19,0.06)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-blue)] transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 border-t border-[rgba(37,42,45,0.08)] pt-3 text-[0.72rem] text-[var(--color-ink-muted)]">
            {adminT.scoring.analyticsCriteriaBasis(submittedCount, assignedCount)}
          </p>
        </>
      )}
    </DashboardCard>
  );
}

import { adminT } from "@/lib/i18n/admin";
import type { ScoreSpread, ScoreSpreadLevel } from "@/features/admin/lib/scoring-metrics";
import { DashboardCard } from "@/shared/components/admin/DashboardUI";

/** Человеческая подпись уровня разброса — общая для сводки и аналитики. */
export function spreadLevelLabel(level: ScoreSpreadLevel) {
  switch (level) {
    case "LOW":
      return adminT.scoring.spreadLow;
    case "MEDIUM":
      return adminT.scoring.spreadMedium;
    default:
      return adminT.scoring.spreadHigh;
  }
}

/**
 * Консистентность оценок: насколько судьи сошлись во мнении.
 * Шкала — отклонение в процентах от максимума номинации, поэтому позиция
 * маркера сопоставима между категориями с разным максимумом.
 */
export default function ScoreConsistency({ spread }: { spread: ScoreSpread }) {
  // Шкала обрезана на 30% отклонения: выше этого разброс уже предельный.
  const markerPosition = spread ? Math.min(Math.max(spread.percentageOfMax / 30, 0), 1) * 100 : 0;

  return (
    <DashboardCard className="rounded-[26px]">
      <h3 className="font-[var(--font-title-family)] text-[1.15rem] font-light tracking-[-0.02em] text-[var(--color-ink)]">
        {adminT.scoring.analyticsConsistency}
      </h3>

      {spread === null ? (
        <p className="mt-4 text-[0.82rem] leading-[1.55] text-[var(--color-ink-soft)]">
          {adminT.scoring.spreadUnavailable}
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
              {adminT.scoring.analyticsSpreadLabel}
            </p>
            <p className="text-right">
              <span className="font-[var(--font-title-family)] text-[1.7rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
                {spread.value.toFixed(1)}
              </span>
              <span className="mt-1 block text-[0.72rem] text-[var(--color-blue)]">
                {spreadLevelLabel(spread.level)}
              </span>
            </p>
          </div>

          <div className="relative mt-5 h-1.5 rounded-full bg-[linear-gradient(90deg,rgba(114,160,193,0.18),rgba(114,160,193,0.5))]">
            <span
              aria-hidden
              className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--color-blue)] shadow-[0_4px_12px_rgba(114,160,193,0.4)]"
              style={{ left: `${markerPosition}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[0.62rem] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
            <span>{adminT.scoring.analyticsScaleLow}</span>
            <span>{adminT.scoring.analyticsScaleMid}</span>
            <span>{adminT.scoring.analyticsScaleHigh}</span>
          </div>
        </>
      )}
    </DashboardCard>
  );
}

import { adminT } from "@/lib/i18n/admin";
import type { ScoreDistributionBucket } from "@/features/admin/lib/scoring-metrics";
import { DashboardCard } from "@/shared/components/admin/DashboardUI";

const bucketLabels: Record<ScoreDistributionBucket["key"], string> = {
  excellent: adminT.scoring.bucketExcellent,
  good: adminT.scoring.bucketGood,
  average: adminT.scoring.bucketAverage,
  low: adminT.scoring.bucketLow,
};

const bucketColors: Record<ScoreDistributionBucket["key"], string> = {
  excellent: "#4d86ad",
  good: "#72a0c1",
  average: "#b9d9eb",
  low: "#dfe6ea",
};

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Распределение отправленных оценок по долям от максимума номинации.
 * Кольцо и легенда считаются из уже отобранных отзывов — компонент только
 * рисует переданные значения.
 */
export default function ScoreDistribution({
  buckets,
  submittedCount,
  averageScoreLabel,
}: {
  buckets: ScoreDistributionBucket[];
  submittedCount: number;
  averageScoreLabel: string;
}) {
  // Смещения дуг считаем заранее: во время рендера ничего не мутируем.
  const segments = buckets.reduce<
    Array<{ bucket: ScoreDistributionBucket; length: number; offset: number }>
  >((accumulator, bucket) => {
    const previous = accumulator.at(-1);
    const offset = previous ? previous.offset + previous.length : 0;
    accumulator.push({ bucket, length: (bucket.share / 100) * CIRCUMFERENCE, offset });
    return accumulator;
  }, []);

  return (
    <DashboardCard className="rounded-[26px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-[var(--font-title-family)] text-[1.15rem] font-light tracking-[-0.02em] text-[var(--color-ink)]">
          {adminT.scoring.analyticsDistribution}
        </h3>
        <p className="text-[0.7rem] text-[var(--color-ink-muted)]">
          {adminT.scoring.analyticsDistributionMeta(submittedCount)}
        </p>
      </div>

      {submittedCount === 0 ? (
        <p className="mt-4 text-[0.82rem] leading-[1.55] text-[var(--color-ink-soft)]">
          {adminT.scoring.analyticsEmpty}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <div className="relative shrink-0">
            <svg viewBox="0 0 140 140" className="size-[128px] -rotate-90" aria-hidden>
              <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#eef3f6" strokeWidth="14" />
              {segments.map(({ bucket, length, offset }) =>
                bucket.share === 0 ? null : (
                  <circle
                    key={bucket.key}
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke={bucketColors[bucket.key]}
                    strokeWidth="14"
                    strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                    strokeDashoffset={-offset}
                  />
                ),
              )}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[var(--font-title-family)] text-[1.5rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
                {averageScoreLabel}
              </span>
              <span className="mt-1 text-[0.58rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                {adminT.scoring.averageShort}
              </span>
            </div>
          </div>

          <ul className="min-w-[150px] flex-1 space-y-2">
            {buckets.map((bucket) => (
              <li key={bucket.key} className="flex items-center justify-between gap-3 text-[0.8rem]">
                <span className="flex min-w-0 items-center gap-2 text-[var(--color-ink-soft)]">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: bucketColors[bucket.key] }}
                  />
                  <span className="truncate">{bucketLabels[bucket.key]}</span>
                </span>
                <span className="shrink-0 text-[var(--color-ink-muted)]">
                  {adminT.scoring.bucketShare(bucket.count, bucket.share)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
}

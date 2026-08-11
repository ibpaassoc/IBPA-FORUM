/**
 * Чистые расчёты для админского аудита оценок.
 *
 * Живут отдельно от React: страницы и API считают метрики на сервере и
 * передают в компоненты уже готовые числа. Средний балл, статус и место в
 * категории по-прежнему считает общая бизнес-логика жюри
 * (`features/jury/server/scoring-shared`) — здесь только производные метрики
 * поверх уже отобранных отправленных отзывов.
 */

import type {
  NominationScoringDefinition,
  ReviewScores,
  ScoringCriterionKey,
} from "@/features/jury/scoring/category-scoring";

export type ScoreSpreadLevel = "LOW" | "MEDIUM" | "HIGH";

export type ScoreRange = {
  min: number;
  max: number;
} | null;

export type ScoreSpread = {
  /** Стандартное отклонение итоговых баллов отправленных отзывов. */
  value: number;
  /** Отклонение в процентах от максимума — основа для уровня разброса. */
  percentageOfMax: number;
  level: ScoreSpreadLevel;
} | null;

export type ScoreDistributionBucket = {
  key: "excellent" | "good" | "average" | "low";
  /** Нижняя граница диапазона в процентах от максимума (включительно). */
  minPercentage: number;
  count: number;
  /** Доля от учтённых отзывов, 0–100. */
  share: number;
};

export type CriterionAverage = {
  key: ScoringCriterionKey;
  maxScore: number;
  /** Средний балл по критерию или null, если его никто не заполнил. */
  average: number | null;
  /** Сколько отзывов содержат оценку по этому критерию. */
  count: number;
  /** Средний балл в процентах от максимума критерия. */
  percentage: number;
};

export type ReviewCompletion = {
  filled: number;
  total: number;
  percentage: number;
};

/** Процент прогресса жюри: сколько назначенных судей уже отправили оценку. */
export function getJuryProgressPercentage({
  assignedJudgeCount,
  submittedJudgeCount,
}: {
  assignedJudgeCount: number;
  submittedJudgeCount: number;
}) {
  if (assignedJudgeCount <= 0) {
    return 0;
  }

  const ratio = submittedJudgeCount / assignedJudgeCount;
  return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
}

/** Минимальный и максимальный итоговый балл среди отправленных отзывов. */
export function getScoreRange(totals: number[]): ScoreRange {
  if (totals.length === 0) {
    return null;
  }

  return {
    min: Math.min(...totals),
    max: Math.max(...totals),
  };
}

/**
 * Разброс оценок: стандартное отклонение (популяционное) итоговых баллов.
 * Для одного отзыва разброс не определён — сравнивать не с чем.
 */
export function getScoreSpread(totals: number[], maximumTotal: number): ScoreSpread {
  if (totals.length < 2 || maximumTotal <= 0) {
    return null;
  }

  const mean = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  const variance =
    totals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / totals.length;
  const value = Math.sqrt(variance);
  const percentageOfMax = (value / maximumTotal) * 100;

  return {
    value,
    percentageOfMax,
    level: percentageOfMax < 8 ? "LOW" : percentageOfMax < 16 ? "MEDIUM" : "HIGH",
  };
}

/** Распределение итоговых баллов по долям от максимума номинации. */
export function getScoreDistribution(
  totals: number[],
  maximumTotal: number
): ScoreDistributionBucket[] {
  const buckets: Array<Omit<ScoreDistributionBucket, "share">> = [
    { key: "excellent", minPercentage: 90, count: 0 },
    { key: "good", minPercentage: 70, count: 0 },
    { key: "average", minPercentage: 50, count: 0 },
    { key: "low", minPercentage: 0, count: 0 },
  ];

  if (maximumTotal > 0) {
    for (const total of totals) {
      const percentage = (total / maximumTotal) * 100;
      const bucket = buckets.find((item) => percentage >= item.minPercentage);
      if (bucket) {
        bucket.count += 1;
      }
    }
  }

  const counted = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return buckets.map((bucket) => ({
    ...bucket,
    share: counted === 0 ? 0 : Math.round((bucket.count / counted) * 100),
  }));
}

/**
 * Средний балл по каждому критерию среди отправленных отзывов.
 * Незаполненные критерии в среднее не попадают, поэтому неполный отзыв не
 * занижает критерии, которые судья всё-таки оценил.
 */
export function getCriteriaAverages(
  reviewScores: Array<Record<string, number | null>>,
  definition: NominationScoringDefinition
): CriterionAverage[] {
  return definition.criteria.map((criterion) => {
    const values = reviewScores
      .map((scores) => scores[criterion.key])
      .filter((value): value is number => typeof value === "number");

    if (values.length === 0) {
      return {
        key: criterion.key,
        maxScore: criterion.maxScore,
        average: null,
        count: 0,
        percentage: 0,
      };
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
      key: criterion.key,
      maxScore: criterion.maxScore,
      average,
      count: values.length,
      percentage:
        criterion.maxScore > 0 ? Math.round((average / criterion.maxScore) * 100) : 0,
    };
  });
}

/** Насколько заполнен отзыв судьи — сколько критериев уже имеют балл. */
export function getReviewCompletion(
  scores: ReviewScores | Record<string, number | null>,
  definition: NominationScoringDefinition
): ReviewCompletion {
  const total = definition.criteria.length;
  const filled = definition.criteria.filter(
    (criterion) => typeof scores[criterion.key] === "number"
  ).length;

  return {
    filled,
    total,
    percentage: total === 0 ? 0 : Math.round((filled / total) * 100),
  };
}

/** Доля балла от максимума, 0–100. Используется в карточках и сводке. */
export function getScorePercentage(score: number | null, maximumTotal: number) {
  if (score === null || maximumTotal <= 0) {
    return null;
  }

  return Math.round((score / maximumTotal) * 100);
}

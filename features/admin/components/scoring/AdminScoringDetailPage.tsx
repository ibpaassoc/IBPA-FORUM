import { ArrowLeft, Activity, ClipboardList, Download, Star, Trophy, Users } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import type { AdminScoringApplicationRecord } from "@/features/admin/server/admin";
import type {
  CriterionAverage,
  ScoreDistributionBucket,
  ScoreSpread,
} from "@/features/admin/lib/scoring-metrics";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import CriteriaAverageChart from "@/features/admin/components/scoring/CriteriaAverageChart";
import type { JudgeReviewRow } from "@/features/admin/components/scoring/JudgeReviewCard";
import JudgeReviewList from "@/features/admin/components/scoring/JudgeReviewList";
import ScoreConsistency, {
  spreadLevelLabel,
} from "@/features/admin/components/scoring/ScoreConsistency";
import ScoreDistribution from "@/features/admin/components/scoring/ScoreDistribution";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import ScoreSummaryCard from "@/features/admin/components/scoring/ScoreSummaryCard";
import {
  DashboardPageHeader,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type ScoringSummary = {
  assignedJudgeCount: number;
  submittedJudgeCount: number;
  averageScore: number | null;
  averageScoreLabel: string;
  averagePercentage: number | null;
  maximumTotal: number;
  progressPercentage: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  rank: number | null;
  categorySize: number;
  spread: ScoreSpread;
  minScore: number | null;
  maxScore: number | null;
};

type ScoringAnalytics = {
  submittedCount: number;
  assignedCount: number;
  maximumTotal: number;
  distribution: ScoreDistributionBucket[];
  criteriaAverages: CriterionAverage[];
  spread: ScoreSpread;
};

/**
 * Детали оценивания одной номинации: сводка, отзывы судей и аналитика по
 * уже отправленным оценкам. Все метрики приходят с сервера — компонент их
 * только раскладывает.
 */
export default function AdminScoringDetailPage({
  application,
  summary,
  scoringDefinition,
  judgeRows,
  analytics,
}: {
  application: AdminScoringApplicationRecord;
  summary: ScoringSummary;
  scoringDefinition: NominationScoringDefinition;
  judgeRows: JudgeReviewRow[];
  analytics: ScoringAnalytics;
}) {
  const rankShare =
    summary.rank && summary.categorySize > 0
      ? Math.max(1, Math.round((summary.rank / summary.categorySize) * 100))
      : null;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.scoring.detailLabel}
        title={application.fullName}
        description={`${application.category.name} / ${application.award.name}`}
        meta={
          <p className="text-[0.75rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {adminT.scoring.nominationId}: {application.shortId}
            {application.email ? <span className="normal-case"> · {application.email}</span> : null}
          </p>
        }
        actions={
          <>
            <DashboardSecondaryBtn href="/admin/scoring">
              <ArrowLeft aria-hidden size={15} />
              {adminT.scoring.backToList}
            </DashboardSecondaryBtn>
            <a
              href={`/api/admin/scoring/${application.id}/export`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]"
            >
              <Download aria-hidden size={15} />
              {adminT.scoring.exportCsv}
            </a>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
        <ScoreSummaryCard
          label={adminT.scoring.averageScore}
          value={summary.averageScoreLabel}
          suffix={summary.averageScore === null ? undefined : `/ ${summary.maximumTotal}`}
          icon={Star}
          detail={
            summary.averagePercentage === null
              ? adminT.scoring.spreadUnavailable
              : adminT.scoring.ofMaxScore(summary.averagePercentage)
          }
        />
        <ScoreSummaryCard
          label={adminT.scoring.rankInCategory}
          value={summary.rank ?? "—"}
          suffix={summary.rank ? `/ ${summary.categorySize}` : undefined}
          icon={Trophy}
          tone="amber"
          detail={rankShare === null ? adminT.scoring.notRanked : adminT.scoring.topPercent(rankShare)}
        />
        <ScoreSummaryCard
          label={adminT.scoring.assignedJudges}
          value={summary.assignedJudgeCount}
          icon={Users}
          detail={adminT.scoring.totalAssigned}
        />
        <ScoreSummaryCard
          label={adminT.scoring.submittedScores}
          value={summary.submittedJudgeCount}
          suffix={`/ ${summary.assignedJudgeCount}`}
          icon={ClipboardList}
          tone="green"
          detail={adminT.scoring.receivedPercentage(summary.progressPercentage)}
        />
        <ScoreSummaryCard
          label={adminT.scoring.scoreStatus}
          value={<ScoreStatusBadge status={summary.status} />}
          icon={Activity}
          detail={adminT.scoring.progressPercentage(summary.progressPercentage)}
        />
        <ScoreSummaryCard
          label={adminT.scoring.scoreSpread}
          value={summary.spread ? summary.spread.value.toFixed(1) : "—"}
          icon={Activity}
          tone="blue"
          detail={
            summary.spread
              ? spreadLevelLabel(summary.spread.level)
              : adminT.scoring.spreadUnavailable
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
        <JudgeReviewList rows={judgeRows} scoringDefinition={scoringDefinition} />

        <aside className="flex flex-col gap-3">
          <ScoreDistribution
            buckets={analytics.distribution}
            submittedCount={analytics.submittedCount}
            averageScoreLabel={summary.averageScoreLabel}
          />
          <CriteriaAverageChart
            criteriaAverages={analytics.criteriaAverages}
            scoringDefinition={scoringDefinition}
            submittedCount={analytics.submittedCount}
            assignedCount={analytics.assignedCount}
          />
          <ScoreConsistency spread={analytics.spread} />
        </aside>
      </div>
    </div>
  );
}

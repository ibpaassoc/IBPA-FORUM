import type { AdminScoringApplicationRecord } from "@/features/admin/server/admin";
import { ArrowLeft, Download, MessageSquareText } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import AdminReopenScoreButton from "@/features/admin/components/scoring/AdminReopenScoreButton";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type ParticipantApplicationDetail = AdminScoringApplicationRecord;

function scoringBadge(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE") {
  switch (status) {
    case "COMPLETE":
      return <DashboardBadge tone="green">{adminT.statuses.COMPLETE}</DashboardBadge>;
    case "IN_PROGRESS":
      return <DashboardBadge tone="amber">{adminT.statuses.IN_PROGRESS}</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{adminT.statuses.NOT_STARTED}</DashboardBadge>;
  }
}

function ScoreStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[16px] border px-2.5 py-2 text-center ${
        highlight
          ? "border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)]"
          : "border-[rgba(37,42,45,0.08)] bg-white/66"
      }`}
    >
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        {label}
      </p>
      <p
        className={`mt-1 font-[var(--font-title-family)] text-xl font-light leading-none tracking-[-0.02em] ${
          highlight ? "text-[var(--color-blue)]" : "text-[var(--color-ink)]"
        }`}
      >
        {value ?? "-"}
      </p>
    </div>
  );
}

function scoreRowBadge(status: string) {
  switch (status) {
    case "SUBMITTED":
      return <DashboardBadge tone="green">{adminT.statuses.SUBMITTED}</DashboardBadge>;
    case "REOPENED":
      return <DashboardBadge tone="blue">{adminT.statuses.REOPENED}</DashboardBadge>;
    case "DRAFT":
      return <DashboardBadge tone="amber">{adminT.statuses.DRAFT}</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">{adminT.statuses.NOT_STARTED}</DashboardBadge>;
  }
}

export default function AdminScoringDetailPage({
  application,
  summary,
  scoringDefinition,
  judgeRows,
}: {
  application: ParticipantApplicationDetail;
  summary: {
    assignedJudgeCount: number;
    submittedJudgeCount: number;
    averageScore: number | null;
    averageScoreLabel: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
    rank: number | null;
  };
  scoringDefinition: NominationScoringDefinition;
  judgeRows: Array<{
    judgeId: string;
    judgeName: string;
    judgeEmail: string;
    scoreId: string | null;
    scores: Record<string, number | null>;
    totalScore: number | null;
    comment: string | null;
    scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED";
    submittedAt: Date | null;
  }>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.scoring.detailLabel}
        title={application.fullName}
        description={`${application.category.name} / ${application.award.name}`}
        actions={
          <>
            <DashboardSecondaryBtn href="/admin/scoring">
              <ArrowLeft aria-hidden size={15} />
              {adminT.common.back}
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

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            {adminT.scoring.averageScore}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            {summary.averageScoreLabel}
          </p>
          <div className="mt-3">{scoringBadge(summary.status)}</div>
        </DashboardAccentBlock>
        <DashboardMetricTile label={adminT.scoring.assignedJudges} value={summary.assignedJudgeCount} />
        <DashboardMetricTile label={adminT.scoring.submittedScores} value={summary.submittedJudgeCount} accent="green" />
        <DashboardMetricTile
          label={adminT.scoring.rankInCategory}
          value={summary.rank ? `#${summary.rank}` : adminT.scoring.notRanked}
          accent="blue"
        />
      </div>

      <DashboardCard className="p-0">
        <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
          <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
            {adminT.scoring.judgeScores}
          </h2>
        </div>

        {judgeRows.length === 0 ? (
          <div className="p-5 text-center text-sm text-[var(--color-ink-muted)]">
            {adminT.scoring.noJudges}
          </div>
        ) : (
          <div className="divide-y divide-[rgba(37,42,45,0.08)]">
            {judgeRows.map((row) => (
              <div key={row.judgeId} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)_150px] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {scoreRowBadge(row.scoreStatus)}
                  </div>
                  <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">{row.judgeName}</p>
                  <p className="mt-1 truncate text-xs text-[var(--color-ink-soft)]">{row.judgeEmail}</p>
                  {row.comment ? (
                    <DashboardPanel className="mt-3">
                      <div className="flex items-start gap-2 text-sm text-[var(--color-ink-soft)]">
                        <MessageSquareText aria-hidden size={15} className="mt-1 shrink-0 text-[var(--color-blue)]" />
                        <p>{row.comment}</p>
                      </div>
                    </DashboardPanel>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {scoringDefinition.criteria.map((criterion) => (
                    <ScoreStat
                      key={criterion.key}
                      label={`${criterion.label} /${criterion.maxScore}`}
                      value={row.scores[criterion.key]}
                    />
                  ))}
                  <ScoreStat label={adminT.scoring.criteria.total} value={row.totalScore} highlight />
                </div>

                <div className="flex justify-start lg:justify-end">
                  {row.scoreId && (row.scoreStatus === "SUBMITTED" || row.scoreStatus === "REOPENED") ? (
                    <AdminReopenScoreButton scoreId={row.scoreId} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

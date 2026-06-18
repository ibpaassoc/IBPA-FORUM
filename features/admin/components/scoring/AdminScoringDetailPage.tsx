import type { ApplicationAnswer, ApplicationFile } from "@prisma/client";
import type { AdminScoringApplicationRecord } from "@/features/admin/server/admin";
import { ArrowLeft, Download, MessageSquareText } from "lucide-react";
import AdminReopenScoreButton from "@/features/admin/components/scoring/AdminReopenScoreButton";
import {
  DashboardAccentBlock,
  DashboardBadge,
  DashboardCard,
  DashboardDetailCard,
  DashboardMetricTile,
  DashboardPageHeader,
  DashboardPanel,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type ParticipantApplicationDetail = AdminScoringApplicationRecord & {
  answers: ApplicationAnswer[];
  files: ApplicationFile[];
};

function scoringBadge(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE") {
  switch (status) {
    case "COMPLETE":
      return <DashboardBadge tone="green">Complete</DashboardBadge>;
    case "IN_PROGRESS":
      return <DashboardBadge tone="amber">In progress</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
  }
}

function scoreRowBadge(status: string) {
  switch (status) {
    case "SUBMITTED":
      return <DashboardBadge tone="green">Submitted</DashboardBadge>;
    case "REOPENED":
      return <DashboardBadge tone="blue">Reopened</DashboardBadge>;
    case "DRAFT":
      return <DashboardBadge tone="amber">Draft</DashboardBadge>;
    default:
      return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
  }
}

export default function AdminScoringDetailPage({
  application,
  summary,
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
  judgeRows: Array<{
    judgeId: string;
    judgeName: string;
    judgeEmail: string;
    scoreId: string | null;
    technical: number | null;
    aesthetic: number | null;
    creativity: number | null;
    impact: number | null;
    presentation: number | null;
    totalScore: number | null;
    comment: string | null;
    scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED";
    submittedAt: Date | null;
  }>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Scoring detail"
        title={application.fullName}
        description={`${application.category.name} / ${application.award.name}`}
        actions={
          <>
            <DashboardSecondaryBtn href="/admin/scoring">
              <ArrowLeft aria-hidden size={15} />
              Back
            </DashboardSecondaryBtn>
            <a
              href={`/api/admin/scoring/${application.id}/export`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-3.5 py-2 text-sm font-semibold leading-none text-[#0A0A0A] transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]"
            >
              <Download aria-hidden size={15} />
              Export CSV
            </a>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-[1.1fr_repeat(3,minmax(0,0.75fr))]">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Average score
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            {summary.averageScoreLabel}
          </p>
          <div className="mt-3">{scoringBadge(summary.status)}</div>
        </DashboardAccentBlock>
        <DashboardMetricTile label="Assigned judges" value={summary.assignedJudgeCount} />
        <DashboardMetricTile label="Submitted scores" value={summary.submittedJudgeCount} accent="green" />
        <DashboardMetricTile
          label="Rank in category"
          value={summary.rank ? `#${summary.rank}` : "Not ranked"}
          accent="blue"
        />
      </div>

      <DashboardCard className="p-0">
        <div className="border-b border-black/10 p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
            Judge breakdown
          </p>
          <h2 className="mt-2 text-2xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
            All judge scores
          </h2>
        </div>

        {judgeRows.length === 0 ? (
          <div className="p-5 text-center text-sm text-black/45">
            No judges have been assigned yet.
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {judgeRows.map((row) => (
              <div key={row.judgeId} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)_150px] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {scoreRowBadge(row.scoreStatus)}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#0A0A0A]">{row.judgeName}</p>
                  <p className="mt-1 truncate text-xs text-black/50">{row.judgeEmail}</p>
                  {row.comment ? (
                    <DashboardPanel className="mt-3">
                      <div className="flex items-start gap-2 text-sm text-black/60">
                        <MessageSquareText aria-hidden size={15} className="mt-1 shrink-0 text-[#1673A5]" />
                        <p>{row.comment}</p>
                      </div>
                    </DashboardPanel>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <DashboardDetailCard label="Tech" value={row.technical ?? "-"} />
                  <DashboardDetailCard label="Aesthetic" value={row.aesthetic ?? "-"} />
                  <DashboardDetailCard label="Creativity" value={row.creativity ?? "-"} />
                  <DashboardDetailCard label="Impact" value={row.impact ?? "-"} />
                  <DashboardDetailCard label="Presentation" value={row.presentation ?? "-"} />
                  <DashboardDetailCard label="Total" value={row.totalScore ?? "-"} />
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

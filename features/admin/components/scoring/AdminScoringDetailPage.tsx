import type { ApplicationAnswer, ApplicationFile } from "@prisma/client";
import type { AdminScoringApplicationRecord } from "@/features/admin/server/admin";
import AdminReopenScoreButton from "@/features/admin/components/scoring/AdminReopenScoreButton";
import {
  DashboardCard,
  DashboardDetailCard,
  DashboardBadge,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type ParticipantApplicationDetail = AdminScoringApplicationRecord & {
  answers: ApplicationAnswer[];
  files: ApplicationFile[];
};

function scoringBadge(status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE") {
  switch (status) {
    case "COMPLETE": return <DashboardBadge tone="green">Complete</DashboardBadge>;
    case "IN_PROGRESS": return <DashboardBadge tone="amber">In progress</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
  }
}

function scoreRowBadge(status: string) {
  switch (status) {
    case "SUBMITTED": return <DashboardBadge tone="green">Submitted</DashboardBadge>;
    case "REOPENED": return <DashboardBadge tone="amber">Reopened</DashboardBadge>;
    case "DRAFT": return <DashboardBadge tone="neutral">Draft</DashboardBadge>;
    default: return <DashboardBadge tone="neutral">Not started</DashboardBadge>;
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
            Scoring Detail
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B]">
            {application.fullName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {application.category.name} / {application.award.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {scoringBadge(summary.status)}
          <DashboardSecondaryBtn href="/admin/scoring">← Back</DashboardSecondaryBtn>
          <a
            href={`/api/admin/scoring/${application.id}/export`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#4C7D9D]/40 hover:text-[#10203B]"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Summary */}
      <DashboardCard>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
          Scoring summary
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DashboardDetailCard label="Average score" value={summary.averageScoreLabel} />
          <DashboardDetailCard label="Assigned judges" value={String(summary.assignedJudgeCount)} />
          <DashboardDetailCard label="Submitted scores" value={String(summary.submittedJudgeCount)} />
          <DashboardDetailCard label="Rank in category" value={summary.rank ? `#${summary.rank}` : "Not ranked"} />
        </div>
      </DashboardCard>

      {/* Judge breakdown */}
      <DashboardCard className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Judge breakdown</p>
          <h2 className="mt-1 text-lg font-semibold text-[#10203B]">All judge scores</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Desktop header */}
          <div className="hidden grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_auto_auto] gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4C7D9D] lg:grid">
            <span>Judge</span>
            <span>Tech</span>
            <span>Aesth</span>
            <span>Creat</span>
            <span>Impact</span>
            <span>Pres</span>
            <span>Total</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {judgeRows.map((row) => (
            <div
              key={row.judgeId}
              className="grid gap-2 px-5 py-4 lg:grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_auto_auto] lg:items-center"
            >
              <div>
                <p className="text-sm font-semibold text-[#10203B]">{row.judgeName}</p>
                <p className="text-xs text-slate-500">{row.judgeEmail}</p>
                {row.comment && (
                  <p className="mt-1.5 rounded-[12px] bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 italic">
                    {row.comment.slice(0, 120)}{row.comment.length > 120 ? "…" : ""}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium text-[#10203B]">{row.technical ?? "—"}</span>
              <span className="text-sm text-slate-600">{row.aesthetic ?? "—"}</span>
              <span className="text-sm text-slate-600">{row.creativity ?? "—"}</span>
              <span className="text-sm text-slate-600">{row.impact ?? "—"}</span>
              <span className="text-sm text-slate-600">{row.presentation ?? "—"}</span>
              <span className="text-sm font-semibold text-[#10203B]">{row.totalScore ?? "—"}</span>
              <div>{scoreRowBadge(row.scoreStatus)}</div>
              <div>
                {row.scoreId && (row.scoreStatus === "SUBMITTED" || row.scoreStatus === "REOPENED") && (
                  <AdminReopenScoreButton scoreId={row.scoreId} />
                )}
              </div>
            </div>
          ))}

          {judgeRows.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              No judges have been assigned yet.
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

import type { ApplicationAnswer, ApplicationFile } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import AdminReopenScoreButton from "@/features/admin/components/scoring/AdminReopenScoreButton";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import type { AdminScoringApplicationRecord } from "@/features/admin/server/admin";
import {
  AdminDashboardShell,
  AdminDataRow,
  AdminDataTable,
  AdminDetailCard,
  AdminHeroCard,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

type ParticipantApplicationDetail = AdminScoringApplicationRecord & {
  answers: ApplicationAnswer[];
  files: ApplicationFile[];
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return <AdminDetailCard label={label} value={value} />;
}

function formatAnswerValue(answer: {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}) {
  if (answer.valueText) {
    return answer.valueText;
  }

  if (answer.valueNumber !== null) {
    return String(answer.valueNumber);
  }

  if (answer.valueBoolean !== null) {
    return answer.valueBoolean ? "Yes" : "No";
  }

  if (Array.isArray(answer.valueJson)) {
    return answer.valueJson.join(", ");
  }

  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }

  return "Not provided";
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
  const categoryFields = categoryFieldConfigs[application.category.slug] ?? [];
  const answerMap = new Map(application.answers.map((answer) => [answer.fieldKey, answer]));
  const fileMap = new Map<string, typeof application.files>();

  for (const file of application.files) {
    const group = fileMap.get(file.fieldKey) ?? [];
    group.push(file);
    fileMap.set(file.fieldKey, group);
  }

  return (
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow="Scoring Admin"
        title={application.fullName}
        subtitle={`${application.category.name} / ${application.award.name}`}
        actions={
          <>
            <AdminToolbarButton href="/admin/scoring">Back to Scoring</AdminToolbarButton>
            <a
              href={`/api/admin/scoring/${application.id}/export`}
              className="hidden admin-action-secondary items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
            >
              Export CSV
            </a>
          </>
        }
      />

        <section className="admin-card rounded-3xl p-6">
            <p className="admin-eyebrow">
            Scoring Summary
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Average Score" value={summary.averageScoreLabel} />
            <DetailItem
                label="Assigned Judges"
                value={String(summary.assignedJudgeCount)}
            />
            <DetailItem
                label="Submitted Scores"
                value={String(summary.submittedJudgeCount)}
            />
            <DetailItem
                label="Rank in Category"
                value={summary.rank ? String(summary.rank) : "Not ranked"}
            />
            </div>
        </section>

        <section className="admin-card mt-6 rounded-3xl p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="admin-eyebrow">
                Judge Breakdown
              </p>
              <h2 className="admin-heading mt-3 text-2xl font-semibold">All judge scores</h2>
            </div>
          </div>

          <AdminDataTable
            headers={[
              "Judge",
              "Technical",
              "Aesthetic",
              "Creativity",
              "Impact",
              "Presentation",
              "Total",
            ]}
          >
            {judgeRows.map((row) => (
              <AdminDataRow
                key={row.judgeId}
              >
                <div className="justify-self-center">
                  <p className="justify-self-center text-sm font-semibold text-(--color-navy-deep)">{row.judgeName}</p>
                  <p className="justify-self-center admin-muted mt-1 text-sm">{row.judgeEmail}</p>
                  {row.comment ? (
                    <p className="justify-self-center admin-muted mt-2 text-sm">{row.comment}</p>
                  ) : null}
                </div>

                <div className="justify-self-center text-sm text-(--admin-ink)">{row.technical ?? "-"}</div>
                <div className="justify-self-center text-sm text-(--admin-ink)">{row.aesthetic ?? "-"}</div>
                <div className="justify-self-center text-sm text-(--admin-ink)">{row.creativity ?? "-"}</div>
                <div className="justify-self-center text-sm text-(--admin-ink)">{row.impact ?? "-"}</div>
                <div className="justify-self-center text-sm text-(--admin-ink)">{row.presentation ?? "-"}</div>
                <div className="justify-self-center text-sm text-(--admin-ink)">{row.totalScore ?? "-"}</div>
              </AdminDataRow>
            ))}
          </AdminDataTable>
        </section>
    </AdminDashboardShell>
  );
}

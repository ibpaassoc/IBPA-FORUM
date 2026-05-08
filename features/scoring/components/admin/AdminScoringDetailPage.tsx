import type { ApplicationAnswer, ApplicationFile } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import AdminReopenScoreButton from "@/features/scoring/components/admin/AdminReopenScoreButton";
import ScoreStatusBadge from "@/features/scoring/components/ScoreStatusBadge";
import type { AdminScoringApplicationRecord } from "@/features/scoring/server/admin";
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
              className="admin-action-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
            >
              Export CSV
            </a>
            <form action={logoutAdminAction}>
              <AdminToolbarButton type="submit">Log Out</AdminToolbarButton>
            </form>
          </>
        }
      />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Participant Details
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem label="Full Legal Name" value={application.fullName} />
                <DetailItem label="Email Address" value={application.email} />
                <DetailItem label="Phone / WhatsApp" value={application.phone} />
                <DetailItem
                  label="Country / City"
                  value={`${application.country}, ${application.city}`}
                />
                <DetailItem
                  label="State / Province"
                  value={application.stateProvince || "Not required / not provided"}
                />
                <DetailItem
                  label="Professional Title"
                  value={application.professionalTitle}
                />
                <DetailItem
                  label="Years of Experience"
                  value={String(application.yearsExperience)}
                />
                <DetailItem label="Category" value={application.category.name} />
                <DetailItem label="Specific Award" value={application.award.name} />
                <DetailItem
                  label="Professional Website"
                  value={application.websiteUrl || "Not provided"}
                />
                <DetailItem
                  label="Instagram / Social"
                  value={application.socialUrl || "Not provided"}
                />
                <DetailItem
                  label="Client Reviews"
                  value={application.reviewsUrl || "Not provided"}
                />
              </div>
            </section>

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Statement and Application Answers
              </p>
              <div className="mt-5 space-y-4">
                {categoryFields
                  .filter((field) => field.type !== "file")
                  .map((field) => {
                    const answer = answerMap.get(field.key);

                    if (!answer) {
                      return null;
                    }

                    return (
                      <DetailItem
                        key={field.key}
                        label={field.label}
                        value={formatAnswerValue(answer)}
                      />
                    );
                  })}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Scoring Summary
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Overall Status" value={summary.status.replaceAll("_", " ")} />
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
                <DetailItem
                  label="Submitted At"
                  value={formatAdminDate(application.submittedAt)}
                />
              </div>

              <div className="admin-empty mt-5 rounded-2xl border border-dashed border-[rgba(184,148,83,0.34)] bg-[var(--admin-gold-soft)] p-4 text-sm">
                TODO: Mark category winner here if a dedicated winner/status field is added to
                the project schema.
              </div>
            </section>

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Uploaded Files
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[var(--admin-ink)]">
                    Professional License / Certification
                  </p>
                  <div className="mt-3 space-y-3">
                    {(fileMap.get("licenseCertification") ?? []).map((file) => (
                      <a
                        key={file.id}
                        href={`/api/admin/application-files/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-[var(--admin-gold)]"
                      >
                        <span>{file.fileName}</span>
                        <span className="admin-muted text-xs">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {categoryFields
                  .filter((field) => field.type === "file")
                  .map((field) => {
                    const files = fileMap.get(field.key) ?? [];

                    return (
                      <div key={field.key}>
                        <p className="text-sm font-semibold text-[var(--admin-ink)]">{field.label}</p>
                        <div className="mt-3 space-y-3">
                          {files.map((file) => (
                            <a
                              key={file.id}
                              href={`/api/admin/application-files/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-[var(--admin-gold)]"
                            >
                              <span>{file.fileName}</span>
                              <span className="admin-muted text-xs">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </a>
                          ))}
                          {files.length === 0 ? (
                            <p className="admin-muted text-sm">
                              No files uploaded for this field.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          </div>
        </div>

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
              "Status",
              "Submitted",
              "Action",
            ]}
            gridClassName="xl:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.85fr_0.95fr_0.9fr] lg:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.85fr_0.95fr_0.9fr]"
          >
            {judgeRows.map((row) => (
              <AdminDataRow
                key={row.judgeId}
                gridClassName="lg:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.85fr_0.95fr_0.9fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--color-navy-deep)]">{row.judgeName}</p>
                  <p className="admin-muted mt-1 text-sm">{row.judgeEmail}</p>
                  {row.comment ? (
                    <p className="admin-muted mt-2 text-sm">{row.comment}</p>
                  ) : null}
                </div>

                <div className="text-sm text-[var(--admin-ink)]">{row.technical ?? "-"}</div>
                <div className="text-sm text-[var(--admin-ink)]">{row.aesthetic ?? "-"}</div>
                <div className="text-sm text-[var(--admin-ink)]">{row.creativity ?? "-"}</div>
                <div className="text-sm text-[var(--admin-ink)]">{row.impact ?? "-"}</div>
                <div className="text-sm text-[var(--admin-ink)]">{row.presentation ?? "-"}</div>
                <div className="text-sm text-[var(--admin-ink)]">{row.totalScore ?? "-"}</div>
                <div>
                  <ScoreStatusBadge status={row.scoreStatus} />
                </div>
                <div className="admin-muted text-sm">
                  {formatAdminDate(row.submittedAt)}
                </div>
                <div>
                  {row.scoreId && row.scoreStatus === "SUBMITTED" ? (
                    <AdminReopenScoreButton scoreId={row.scoreId} />
                  ) : (
                    <span className="admin-muted text-xs">No action</span>
                  )}
                </div>
              </AdminDataRow>
            ))}
          </AdminDataTable>
        </section>
    </AdminDashboardShell>
  );
}

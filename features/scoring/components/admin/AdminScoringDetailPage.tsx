import Link from "next/link";
import type { ApplicationAnswer, ApplicationFile } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import AdminReopenScoreButton from "@/features/scoring/components/admin/AdminReopenScoreButton";
import ScoreStatusBadge from "@/features/scoring/components/ScoreStatusBadge";
import type { AdminScoringApplicationRecord } from "@/features/scoring/server/admin";
import { PageShell } from "@/shared/components/layout/PageShell";

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
  return (
    <div className="rounded-2xl border border-white/12 bg-white/4.5 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#f1ecde]">{value}</p>
    </div>
  );
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
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Scoring Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {application.fullName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              {application.category.name} / {application.award.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/scoring"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Back to Scoring
            </Link>
            <a
              href={`/api/admin/scoring/${application.id}/export`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Export CSV
            </a>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
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

            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
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
            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
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

              <div className="mt-5 rounded-2xl border border-dashed border-[#d8c27a]/25 bg-white/[0.025] p-4 text-sm text-[#d9d4ca]/75">
                TODO: Mark category winner here if a dedicated winner/status field is added to
                the project schema.
              </div>
            </section>

            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Uploaded Files
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-medium text-white">
                    Professional License / Certification
                  </p>
                  <div className="mt-3 space-y-3">
                    {(fileMap.get("licenseCertification") ?? []).map((file) => (
                      <a
                        key={file.id}
                        href={`/api/admin/application-files/${file.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.035] px-4 py-3 text-sm text-[#d9d4ca] transition hover:border-[#d8c27a] hover:text-white"
                      >
                        <span>{file.fileName}</span>
                        <span className="text-xs text-white/45">
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
                        <p className="text-sm font-medium text-white">{field.label}</p>
                        <div className="mt-3 space-y-3">
                          {files.map((file) => (
                            <a
                              key={file.id}
                              href={`/api/admin/application-files/${file.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.035] px-4 py-3 text-sm text-[#d9d4ca] transition hover:border-[#d8c27a] hover:text-white"
                            >
                              <span>{file.fileName}</span>
                              <span className="text-xs text-white/45">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </a>
                          ))}
                          {files.length === 0 ? (
                            <p className="text-sm text-[#d9d4ca]/75">
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

        <section className="page-card mt-6 rounded-3xl p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Judge Breakdown
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">All judge scores</h2>
            </div>
          </div>

          <div className="hidden grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.85fr_0.95fr_0.9fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9d4ca]/65 xl:grid">
            <span>Judge</span>
            <span>Technical</span>
            <span>Aesthetic</span>
            <span>Creativity</span>
            <span>Impact</span>
            <span>Presentation</span>
            <span>Total</span>
            <span>Status</span>
            <span>Submitted</span>
            <span>Action</span>
          </div>

          <div className="divide-y divide-white/10">
            {judgeRows.map((row) => (
              <div
                key={row.judgeId}
                className="grid gap-4 px-4 py-5 xl:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.85fr_0.95fr_0.9fr] xl:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{row.judgeName}</p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">{row.judgeEmail}</p>
                  {row.comment ? (
                    <p className="mt-2 text-sm text-[#d9d4ca]/75">{row.comment}</p>
                  ) : null}
                </div>

                <div className="text-sm text-[#d9d4ca]">{row.technical ?? "-"}</div>
                <div className="text-sm text-[#d9d4ca]">{row.aesthetic ?? "-"}</div>
                <div className="text-sm text-[#d9d4ca]">{row.creativity ?? "-"}</div>
                <div className="text-sm text-[#d9d4ca]">{row.impact ?? "-"}</div>
                <div className="text-sm text-[#d9d4ca]">{row.presentation ?? "-"}</div>
                <div className="text-sm text-[#d9d4ca]">{row.totalScore ?? "-"}</div>
                <div>
                  <ScoreStatusBadge status={row.scoreStatus} />
                </div>
                <div className="text-sm text-[#d9d4ca]/75">
                  {formatAdminDate(row.submittedAt)}
                </div>
                <div>
                  {row.scoreId && row.scoreStatus === "SUBMITTED" ? (
                    <AdminReopenScoreButton scoreId={row.scoreId} />
                  ) : (
                    <span className="text-xs text-[#d9d4ca]/60">No action</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

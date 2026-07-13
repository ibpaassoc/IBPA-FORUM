import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { requireOwnedNomination } from "@/features/account/server/nomination-guards";
import {
  DashboardBadge,
  DashboardCard,
  DashboardEmptyState,
  DashboardPanel,
  DashboardShell,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

function answerValue(answer: {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}) {
  if (answer.valueText) return answer.valueText;
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "Yes" : "No";
  if (Array.isArray(answer.valueJson)) return answer.valueJson.join(", ");
  if (answer.valueJson && typeof answer.valueJson === "object") return JSON.stringify(answer.valueJson);
  return "Not provided";
}

function label(fieldKey: string) {
  return fieldKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .trim()
    .replace(/^./, (value) => value.toUpperCase());
}

export default async function ApplicantNominationPage({
  params,
}: {
  params: Promise<{ nominationId: string }>;
}) {
  const { nominationId } = await params;
  const { nomination } = await requireOwnedNomination(nominationId);
  const locked = nomination.lockedAt !== null || nomination.status === "LOCKED";
  const scoreVisible = nomination.scoresReleasedAt !== null;
  const submittedScores = nomination.judgeScores
    .map((score) => score.totalScore)
    .filter((value): value is number => typeof value === "number");
  const averageScore =
    submittedScores.length > 0
      ? submittedScores.reduce((sum, value) => sum + value, 0) / submittedScores.length
      : null;

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-3 pb-24 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <SecondaryButton href="/account/applicant">
          <ArrowLeft size={16} /> Back to dashboard
        </SecondaryButton>

        <DashboardPanel>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                {nomination.category.name}
              </p>
              <h1 className="mt-2 font-[var(--font-title-family)] text-4xl font-light leading-tight text-[var(--color-ink)]">
                {nomination.award.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <DashboardBadge tone={nomination.paymentStatus === "PAID" ? "green" : "amber"}>
                {nomination.paymentStatus.toLowerCase()}
              </DashboardBadge>
              <DashboardBadge tone={locked ? "purple" : "neutral"}>
                {locked ? "Locked" : nomination.status.toLowerCase().replaceAll("_", " ")}
              </DashboardBadge>
            </div>
          </div>
        </DashboardPanel>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <DashboardPanel>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              Nomination answers
            </h2>
            {nomination.answers.length === 0 ? (
              <div className="mt-4">
                <DashboardEmptyState
                  icon={<FileText size={20} />}
                  title="No saved answers"
                  description="Use the application form to complete this nomination."
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {nomination.answers.map((answer) => (
                  <DashboardCard key={answer.id} className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      {label(answer.fieldKey)}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-ink)]">
                      {answerValue(answer)}
                    </p>
                  </DashboardCard>
                ))}
              </div>
            )}
          </DashboardPanel>

          <aside className="flex flex-col gap-5">
            <DashboardPanel>
              <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                Files
              </h2>
              {nomination.files.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-ink-soft)]">No files uploaded.</p>
              ) : (
                <div className="mt-4 grid gap-2">
                  {nomination.files.map((file) => (
                    <Link
                      key={file.id}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-white/72 px-3 py-3 text-sm text-[var(--color-ink)] hover:bg-[var(--color-blue-wash)]"
                    >
                      <span className="min-w-0 truncate">{file.fileName}</span>
                      <ExternalLink size={14} className="shrink-0 text-[var(--color-blue)]" />
                    </Link>
                  ))}
                </div>
              )}
            </DashboardPanel>

            <DashboardPanel>
              <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
                Scores
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                {scoreVisible && averageScore !== null
                  ? `Final score: ${averageScore.toFixed(1)}`
                  : "Scores have not been released yet."}
              </p>
            </DashboardPanel>
          </aside>
        </div>
      </main>
    </DashboardShell>
  );
}

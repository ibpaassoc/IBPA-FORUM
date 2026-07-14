import { ArrowLeft } from "lucide-react";
import NominationEditorForm from "@/features/account/components/NominationEditorForm";
import { requireOwnedNomination } from "@/features/account/server/nomination-guards";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  DashboardBadge,
  DashboardPanel,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

export default async function ApplicantNominationPage({
  params,
}: {
  params: Promise<{ nominationId: string }>;
}) {
  const { nominationId } = await params;
  const { nomination } = await requireOwnedNomination(nominationId);
  const locked = nomination.lockedAt !== null || nomination.status === "LOCKED";
  const scoreVisible = nomination.scoresReleasedAt !== null;
  const categoryFields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const submittedScores = nomination.judgeScores
    .map((score) => score.totalScore)
    .filter((value): value is number => typeof value === "number");
  const averageScore =
    submittedScores.length > 0
      ? submittedScores.reduce((sum, value) => sum + value, 0) / submittedScores.length
      : null;

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
      <div>
        <SecondaryButton href="/account/applicant/nominations">
          <ArrowLeft size={16} /> Back to nominations
        </SecondaryButton>
      </div>

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
            Nomination editor
          </h2>
          <div className="mt-4">
            <NominationEditorForm
              nominationId={nomination.id}
              fields={categoryFields}
              initialAnswers={nomination.answers}
              initialFiles={nomination.files}
              locked={locked}
              initialStatus={nomination.status}
            />
          </div>
        </DashboardPanel>

        <aside className="flex flex-col gap-5">
          <DashboardPanel>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">
              Status
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              Purchased nominations can be saved as drafts or submitted to the jury. Submitted nominations stay editable until applications close.
            </p>
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
    </div>
  );
}

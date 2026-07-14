import NominationReviewForm from "@/features/account/components/nomination-review/NominationReviewForm";
import { requireOwnedNomination } from "@/features/account/server/nomination-guards";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";

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
    <div className="mx-auto w-full max-w-[1180px]">
      <NominationReviewForm
        nominationId={nomination.id}
        fields={categoryFields}
        initialAnswers={nomination.answers}
        initialFiles={nomination.files}
        locked={locked}
        paymentPaid={nomination.paymentStatus === "PAID"}
        initialStatus={nomination.status}
        categoryName={nomination.category.name}
        awardName={nomination.award.name}
        updatedAtIso={nomination.updatedAt ? nomination.updatedAt.toISOString() : null}
        scoreVisible={scoreVisible}
        averageScore={averageScore}
      />
    </div>
  );
}

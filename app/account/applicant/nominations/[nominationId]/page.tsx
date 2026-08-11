import NominationReviewForm from "@/features/account/components/nomination-review/NominationReviewForm";
import {
  getApplicantNominationNavigation,
  requireOwnedNomination,
} from "@/features/account/server/nomination-guards";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { activateRequestDataScope } from "@/features/test/server/data-scope";

export default async function ApplicantNominationPage({
  params,
}: {
  params: Promise<{ nominationId: string }>;
}) {
  const { nominationId } = await params;
  const { nomination, applicantProfile, submissionAccess } = await requireOwnedNomination(nominationId);
  activateRequestDataScope({ dataScope: nomination.dataScope });
  const nominationNavigation = await getApplicantNominationNavigation(
    applicantProfile.id,
    submissionAccess.isOpen,
  );
  const locked = nomination.status === "LOCKED" || !submissionAccess.isOpen;
  const scoreVisible = nomination.scoresReleasedAt !== null;
  const categoryFields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const submittedScores = nomination.reviews
    .map((score) => score.totalScore)
    .filter((value) => value !== null)
    .map(Number);
  const averageScore =
    submittedScores.length > 0
      ? submittedScores.reduce((sum, value) => sum + value, 0) / submittedScores.length
      : null;

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <NominationReviewForm
        nominationId={nomination.id}
        categorySlug={nomination.category.slug}
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
        nominations={nominationNavigation}
      />
    </div>
  );
}

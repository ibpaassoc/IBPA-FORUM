import JuryNominationReviewPage from "@/features/account/components/jury/JuryNominationReviewPage";
import { getAuthenticatedJuryContext, getJuryNominationReviewDetail } from "@/features/jury/server/reviews";

export default async function AccountJuryNominationPage({
  params,
}: {
  params: Promise<{ nominationId: string }>;
}) {
  const judge = await getAuthenticatedJuryContext();
  const { nominationId } = await params;
  const data = await getJuryNominationReviewDetail({
    judge,
    nominationId,
  });

  return (
    <JuryNominationReviewPage
      nomination={data.nomination}
      categoryFields={data.categoryFields}
      scoringDefinition={data.scoringDefinition}
      review={data.review}
    />
  );
}

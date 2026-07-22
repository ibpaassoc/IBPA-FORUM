import JuryNominationReviewPage from "@/features/account/components/jury/JuryNominationReviewPage";
import {
  getAuthenticatedJuryContext,
  getJuryNominationReviewDetail,
  getJuryNominationWorkspace,
} from "@/features/jury/server/reviews";

export default async function AccountJuryNominationPage({
  params,
}: {
  params: Promise<{ nominationId: string }>;
}) {
  const judge = await getAuthenticatedJuryContext();
  const { nominationId } = await params;
  const [data, workspace] = await Promise.all([
    getJuryNominationReviewDetail({ judge, nominationId }),
    getJuryNominationWorkspace({ judge }),
  ]);

  return (
    <JuryNominationReviewPage
      nomination={data.nomination}
      categoryFields={data.categoryFields}
      scoringDefinition={data.scoringDefinition}
      review={data.review}
      nominations={workspace.allNominations}
    />
  );
}

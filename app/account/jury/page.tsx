import JuryOverview from "@/features/account/components/jury/JuryOverview";
import { getAuthenticatedJuryContext, getJuryNominationWorkspace } from "@/features/jury/server/reviews";

export default async function AccountJuryPage() {
  const judge = await getAuthenticatedJuryContext();
  const data = await getJuryNominationWorkspace({ judge });

  return (
    <JuryOverview
      nominations={data.allNominations}
      totals={data.totals}
    />
  );
}

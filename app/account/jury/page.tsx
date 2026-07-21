import JuryOverview from "@/features/account/components/jury/JuryOverview";
import { getAuthenticatedJuryContext, getJuryNominationWorkspace } from "@/features/jury/server/reviews";

export default async function AccountJuryPage() {
  const judge = await getAuthenticatedJuryContext();
  const data = await getJuryNominationWorkspace({ judge });

  return <JuryOverview juryName={data.judge.fullName} professionalTitle={data.judge.professionalTitle} expertiseAreas={data.judge.expertiseAreas} nominations={data.allNominations} totals={data.totals} />;
}

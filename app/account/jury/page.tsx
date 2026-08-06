import JuryOverview from "@/features/account/components/jury/JuryOverview";
import { findSameScopeAccount } from "@/features/account/server/accounts";
import { getAuthenticatedJuryContext, getJuryNominationWorkspace } from "@/features/jury/server/reviews";

export default async function AccountJuryPage() {
  const judge = await getAuthenticatedJuryContext();
  const [data, applicantAccount] = await Promise.all([
    getJuryNominationWorkspace({ judge }),
    findSameScopeAccount({
      email: judge.email,
      role: "APPLICANT",
      dataScope: judge.dataScope,
    }),
  ]);

  return (
    <JuryOverview
      nominations={data.allNominations}
      totals={data.totals}
      hasApplicantAccount={Boolean(applicantAccount)}
    />
  );
}

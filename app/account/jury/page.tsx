import JuryOverview from "@/features/account/components/jury/JuryOverview";
import { getAuthenticatedJuryContext, getJuryNominationWorkspace } from "@/features/jury/server/reviews";
import { getNotificationsForAccount } from "@/features/notifications/server/notifications";

export default async function AccountJuryPage() {
  const judge = await getAuthenticatedJuryContext();
  const [data, notifications] = await Promise.all([
    getJuryNominationWorkspace({ judge }),
    getNotificationsForAccount(judge.accountId, 3),
  ]);

  return (
    <JuryOverview
      nominations={data.allNominations}
      totals={data.totals}
      notifications={notifications}
    />
  );
}

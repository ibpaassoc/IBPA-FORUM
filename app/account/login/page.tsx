import { redirect } from "next/navigation";
import JuryLoginContent from "@/features/auth/components/JuryLoginContent";
import { getAppSession } from "@/auth";
import {
  findAccountForPublicSession,
  getDashboardPathForRole,
} from "@/features/account/server/accounts";

export default async function AccountLoginPage() {
  const session = await getAppSession();

  if (session?.user?.accountId && session.user.role) {
    const account = await findAccountForPublicSession(session.user.accountId);
    if (account && !account.deletedAt && account.status !== "DISABLED") {
      redirect(getDashboardPathForRole(account.role));
    }
  }

  return <JuryLoginContent />;
}

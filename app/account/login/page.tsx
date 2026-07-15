import { redirect } from "next/navigation";
import JuryLoginContent from "@/features/auth/components/JuryLoginContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";

export default async function AccountLoginPage() {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  return <JuryLoginContent />;
}

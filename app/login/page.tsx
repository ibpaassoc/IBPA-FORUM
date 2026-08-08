import { redirect } from "next/navigation";
import JuryLoginContent from "@/features/auth/components/JuryLoginContent";
import { getAppSession } from "@/auth";
import { findAccountForPublicSession, getDashboardPathForRole } from "@/features/account/server/accounts";
import { parsePublicAccountRole, safeInternalNext } from "@/features/auth/lib/role";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string; switch?: string }>;
}) {
  const [{ role: roleParam, next: nextParam }, session] = await Promise.all([searchParams, getAppSession()]);
  const role = parsePublicAccountRole(roleParam);
  const next = safeInternalNext(nextParam, "");

  if (session?.user?.accountId && session.user.role) {
    const account = await findAccountForPublicSession(session.user.accountId);
    if (!roleParam && account && account.status !== "DISABLED") {
      redirect(getDashboardPathForRole(account.role));
    }
  }

  return <JuryLoginContent role={role} next={next} />;
}

import { redirect } from "next/navigation";
import ResetPasswordContent from "@/features/auth/components/ResetPasswordContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";
import { validateAccountToken } from "@/features/account/server/tokens";
import { parsePublicAccountRole } from "@/features/auth/lib/role";

export default async function AccountResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; role?: string }>;
}) {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const { token, role: roleParam } = await searchParams;
  const requestedRole = parsePublicAccountRole(roleParam);

  if (!token) {
    return <ResetPasswordContent token="" tokenState="missing" role={requestedRole} />;
  }

  const result = await validateAccountToken({ token, purpose: "PASSWORD_RESET" });

  if (!result.valid) {
    return <ResetPasswordContent token={token} tokenState={result.expired ? "expired" : "invalid"} role={requestedRole} />;
  }

  return <ResetPasswordContent token={token} tokenState="valid" role={result.record.account.role === "JURY" ? "jury" : "applicant"} />;
}

import { redirect } from "next/navigation";
import ResetPasswordContent from "@/features/auth/components/ResetPasswordContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";
import { validateAccountToken } from "@/features/account/server/tokens";

export default async function AccountResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const { token } = await searchParams;

  if (!token) {
    return <ResetPasswordContent token="" tokenState="missing" />;
  }

  const result = await validateAccountToken({ token, purpose: "PASSWORD_RESET" });

  if (!result.valid) {
    return <ResetPasswordContent token={token} tokenState={result.expired ? "expired" : "invalid"} />;
  }

  return <ResetPasswordContent token={token} tokenState="valid" />;
}

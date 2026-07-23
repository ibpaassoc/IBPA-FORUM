import { redirect } from "next/navigation";
import ForgotPasswordContent from "@/features/auth/components/ForgotPasswordContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";

export default async function AccountForgotPasswordPage() {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  return <ForgotPasswordContent />;
}

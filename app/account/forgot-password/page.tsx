import { redirect } from "next/navigation";
import ForgotPasswordContent from "@/features/auth/components/ForgotPasswordContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";
import { parsePublicAccountRole } from "@/features/auth/lib/role";

export default async function AccountForgotPasswordPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const { role } = await searchParams;
  return <ForgotPasswordContent role={parsePublicAccountRole(role)} />;
}

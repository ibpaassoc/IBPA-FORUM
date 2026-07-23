import { redirect } from "next/navigation";
import AccountSetupContent from "@/features/auth/components/AccountSetupContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";
import { validateAccountToken } from "@/features/account/server/tokens";
import { prisma } from "@/shared/lib/prisma";

export default async function AccountSetupPage({
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
    return <AccountSetupContent token="" tokenState="missing" />;
  }

  const result = await validateAccountToken({ token, purpose: "SETUP" });

  if (!result.valid) {
    return <AccountSetupContent token={token} tokenState={result.expired ? "expired" : "invalid"} />;
  }

  // The account already completed setup through another path (register/reset/admin)
  // while this setup link stayed live. Send them to sign in instead of a dead-end form.
  const account = await prisma.account.findUnique({
    where: { id: result.record.accountId },
    select: { passwordHash: true },
  });

  if (account?.passwordHash) {
    redirect("/account/login");
  }

  return <AccountSetupContent token={token} tokenState="valid" />;
}

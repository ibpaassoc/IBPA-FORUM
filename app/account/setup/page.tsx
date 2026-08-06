import { redirect } from "next/navigation";
import AccountSetupContent from "@/features/auth/components/AccountSetupContent";
import { getAppSession } from "@/auth";
import { getDashboardPathForRole } from "@/features/account/server/accounts";
import { validateAccountToken } from "@/features/account/server/tokens";
import { prisma } from "@/shared/lib/prisma";
import { parsePublicAccountRole } from "@/features/auth/lib/role";

export default async function AccountSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; role?: string }>;
}) {
  const session = await getAppSession();

  if (session?.user?.role) {
    redirect(getDashboardPathForRole(session.user.role));
  }

  const { token, role: roleParam } = await searchParams;
  const role = parsePublicAccountRole(roleParam);

  if (!token) {
    return <AccountSetupContent token="" tokenState="missing" role={role} />;
  }

  const result = await validateAccountToken({ token, purpose: "SETUP" });

  if (!result.valid) {
    return <AccountSetupContent token={token} tokenState={result.expired ? "expired" : "invalid"} role={role} />;
  }

  // The account already completed setup through another path (register/reset/admin)
  // while this setup link stayed live. Send them to sign in instead of a dead-end form.
  const account = await prisma.account.findUnique({
    where: { id: result.record.accountId },
    select: { passwordHash: true },
  });

  if (account?.passwordHash) {
    redirect(`/login?role=${result.record.account.role === "JURY" ? "jury" : "applicant"}`);
  }

  return <AccountSetupContent token={token} tokenState="valid" role={result.record.account.role === "JURY" ? "jury" : "applicant"} />;
}

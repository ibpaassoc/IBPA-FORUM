import AccountSetupContent from "@/features/auth/components/AccountSetupContent";
import { validateAccountToken } from "@/features/account/server/tokens";

export default async function AccountSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <AccountSetupContent token="" tokenState="missing" />;
  }

  const result = await validateAccountToken({ token, purpose: "SETUP" });

  if (!result.valid) {
    return <AccountSetupContent token={token} tokenState={result.expired ? "expired" : "invalid"} />;
  }

  return <AccountSetupContent token={token} tokenState="valid" />;
}

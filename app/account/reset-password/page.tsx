import ResetPasswordContent from "@/features/auth/components/ResetPasswordContent";
import { validateAccountToken } from "@/features/account/server/tokens";

export default async function AccountResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
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

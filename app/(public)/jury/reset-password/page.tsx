import { validatePasswordResetToken } from "@/features/jury/server/auth";
import ResetPasswordContent from "@/features/auth/components/ResetPasswordContent";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ResetPasswordContent token="" tokenState="missing" />;
  }

  const { valid, expired } = await validatePasswordResetToken(token);

  if (!valid) {
    return <ResetPasswordContent token={token} tokenState={expired ? "expired" : "invalid"} />;
  }

  return <ResetPasswordContent token={token} tokenState="valid" />;
}

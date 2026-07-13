"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import SetupPasswordForm from "@/features/auth/components/SetupPasswordForm";

export default function AccountSetupContent({
  token,
  tokenState,
}: {
  token: string;
  tokenState: "missing" | "invalid" | "expired" | "valid";
}) {
  return (
    <AuthShell
      eyebrow="IBPA Account"
      title="Set your password"
      description="Use your secure one-time link to activate your IBPA account."
    >
      <SetupPasswordForm token={token} tokenState={tokenState} />
    </AuthShell>
  );
}

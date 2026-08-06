"use client";

import AuthShell from "@/features/auth/components/AuthShell";
import SetupPasswordForm from "@/features/auth/components/SetupPasswordForm";

export default function AccountSetupContent({
  token,
  tokenState,
  role,
}: {
  token: string;
  tokenState: "missing" | "invalid" | "expired" | "valid";
  role: "applicant" | "jury";
}) {
  return (
    <AuthShell
      eyebrow="IBPA Account"
      title="Set your password"
      description="Use your secure one-time link to activate your IBPA account."
    >
      <SetupPasswordForm token={token} tokenState={tokenState} role={role} />
    </AuthShell>
  );
}

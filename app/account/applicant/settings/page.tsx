import ApplicantSettingsContent from "@/features/account/components/settings/ApplicantSettingsContent";
import { requireApplicantAccount } from "@/features/account/server/accounts";

export default async function ApplicantSettingsPage() {
  const { account } = await requireApplicantAccount();

  return (
    <ApplicantSettingsContent
      email={account.email}
      status={account.status}
      createdAtIso={account.createdAt.toISOString()}
    />
  );
}

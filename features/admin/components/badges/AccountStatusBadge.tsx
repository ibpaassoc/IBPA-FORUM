import { adminT } from "@/lib/i18n/admin";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

const accountStatusTones = {
  INVITED: "amber",
  ACTIVE: "green",
  DISABLED: "red",
} as const;

export default function AccountStatusBadge({ status }: { status: string }) {
  const tone =
    status in accountStatusTones
      ? accountStatusTones[status as keyof typeof accountStatusTones]
      : "neutral";

  return (
    <DashboardBadge tone={tone}>
      {adminT.jury.accountBadge}: {adminT.statuses[status] ?? status}
    </DashboardBadge>
  );
}

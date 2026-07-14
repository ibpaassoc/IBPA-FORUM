import { adminT } from "@/lib/i18n/admin";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

const statusTones = {
  DRAFT: "neutral",
  PAYMENT_PENDING: "amber",
  PURCHASED: "amber",
  SUBMITTED: "blue",
  UNDER_REVIEW: "amber",
  RETURNED_FOR_CHANGES: "amber",
  LOCKED: "neutral",
  SCORED: "green",
  WITHDRAWN: "red",
  ADDITIONAL_INFO_REQUIRED: "amber",
  APPROVED: "green",
  REJECTED: "red",
  PAID: "green",
} as const;

export default function ApplicationStatusBadge({
  status,
}: {
  status: string;
}) {
  const tone = status in statusTones ? statusTones[status as keyof typeof statusTones] : "neutral";

  return (
    <DashboardBadge tone={tone}>
      {adminT.statuses[status]}
    </DashboardBadge>
  );
}

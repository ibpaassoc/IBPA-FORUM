import { adminT } from "@/lib/i18n/admin";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

const statusTones = {
  DRAFT: "neutral",
  PAYMENT_PENDING: "amber",
  SUBMITTED: "blue",
  UNDER_REVIEW: "amber",
  ADDITIONAL_INFO_REQUIRED: "amber",
  APPROVED: "green",
  REJECTED: "red",
  PAID: "green",
} as const;

export default function ApplicationStatusBadge({
  status,
}: {
  status: keyof typeof statusTones;
}) {
  return (
    <DashboardBadge tone={statusTones[status]}>
      {adminT.statuses[status]}
    </DashboardBadge>
  );
}

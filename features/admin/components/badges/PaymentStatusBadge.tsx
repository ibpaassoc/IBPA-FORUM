import { adminT } from "@/lib/i18n/admin";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

const paymentStatusTones = {
  PENDING: "amber",
  PARTIALLY_PAID: "blue",
  PAST_DUE: "red",
  PAID: "green",
  FAILED: "red",
  EXPIRED: "neutral",
  REFUNDED: "neutral",
} as const;

export default function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const tone =
    status in paymentStatusTones
      ? paymentStatusTones[status as keyof typeof paymentStatusTones]
      : "neutral";

  return (
    <DashboardBadge tone={tone}>
      {adminT.statuses[status]}
    </DashboardBadge>
  );
}

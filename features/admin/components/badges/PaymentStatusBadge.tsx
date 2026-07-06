import { adminT } from "@/lib/i18n/admin";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

const paymentStatusTones = {
  PENDING: "amber",
  PAID: "green",
  FAILED: "red",
  EXPIRED: "neutral",
  REFUNDED: "neutral",
} as const;

export default function PaymentStatusBadge({
  status,
}: {
  status: keyof typeof paymentStatusTones;
}) {
  return (
    <DashboardBadge tone={paymentStatusTones[status]}>
      {adminT.statuses[status]}
    </DashboardBadge>
  );
}

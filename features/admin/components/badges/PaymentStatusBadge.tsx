"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
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
  const { t } = useLanguage();

  return (
    <DashboardBadge tone={paymentStatusTones[status]}>
      {t.statuses[status]}
    </DashboardBadge>
  );
}

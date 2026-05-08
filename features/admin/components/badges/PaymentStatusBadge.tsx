"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminStatusBadge } from "@/shared/components/admin/AdminDashboard";

const paymentStatusStyles = {
  PENDING: "gold",
  PAID: "success",
  FAILED: "danger",
  EXPIRED: "muted",
  REFUNDED: "neutral",
} as const;

export default function PaymentStatusBadge({
  status,
}: {
  status: keyof typeof paymentStatusStyles;
}) {
  const { t } = useLanguage();

  return (
    <AdminStatusBadge tone={paymentStatusStyles[status]}>
      {t.statuses[status]}
    </AdminStatusBadge>
  );
}

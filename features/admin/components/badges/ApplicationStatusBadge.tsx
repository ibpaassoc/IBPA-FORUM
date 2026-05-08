"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminStatusBadge } from "@/shared/components/admin/AdminDashboard";

const statusStyles = {
  DRAFT: "muted",
  PAYMENT_PENDING: "gold",
  SUBMITTED: "navy",
  UNDER_REVIEW: "gold",
  APPROVED: "success",
  REJECTED: "danger",
  PAID: "success",
} as const;

export default function ApplicationStatusBadge({
  status,
}: {
  status: keyof typeof statusStyles;
}) {
  const { t } = useLanguage();

  return (
    <AdminStatusBadge tone={statusStyles[status]}>
      {t.statuses[status]}
    </AdminStatusBadge>
  );
}

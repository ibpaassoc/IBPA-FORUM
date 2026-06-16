"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

const statusTones = {
  DRAFT: "neutral",
  PAYMENT_PENDING: "amber",
  SUBMITTED: "blue",
  UNDER_REVIEW: "amber",
  APPROVED: "green",
  REJECTED: "red",
  PAID: "green",
} as const;

export default function ApplicationStatusBadge({
  status,
}: {
  status: keyof typeof statusTones;
}) {
  const { t } = useLanguage();

  return (
    <DashboardBadge tone={statusTones[status]}>
      {t.statuses[status]}
    </DashboardBadge>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { AdminStatusBadge } from "@/shared/components/admin/AdminDashboard";

type ScoreStatusBadgeProps = {
  status: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED" | "IN_PROGRESS" | "COMPLETE";
};

const statusStyles: Record<
  ScoreStatusBadgeProps["status"],
  "muted" | "gold" | "success" | "blue"
> = {
  NOT_STARTED: "muted",
  DRAFT: "gold",
  SUBMITTED: "success",
  REOPENED: "blue",
  IN_PROGRESS: "gold",
  COMPLETE: "success",
};

export default function ScoreStatusBadge({ status }: ScoreStatusBadgeProps) {
  const { t } = useLanguage();

  return (
    <AdminStatusBadge tone={statusStyles[status]}>
      {t.statuses[status]}
    </AdminStatusBadge>
  );
}

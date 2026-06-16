"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

type ScoreStatusBadgeProps = {
  status: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED" | "IN_PROGRESS" | "COMPLETE";
};

const statusTones: Record<ScoreStatusBadgeProps["status"], "neutral" | "amber" | "green" | "blue"> = {
  NOT_STARTED: "neutral",
  DRAFT: "amber",
  SUBMITTED: "green",
  REOPENED: "blue",
  IN_PROGRESS: "amber",
  COMPLETE: "green",
};

export default function ScoreStatusBadge({ status }: ScoreStatusBadgeProps) {
  const { t } = useLanguage();

  return (
    <DashboardBadge tone={statusTones[status]}>
      {t.statuses[status]}
    </DashboardBadge>
  );
}

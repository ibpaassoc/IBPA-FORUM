import { adminT } from "@/lib/i18n/admin";
import { DashboardBadge } from "@/shared/components/admin/DashboardUI";

/**
 * Единый бейдж статуса для аудита оценок: и для номинации целиком
 * (не начато / в процессе / завершено), и для отдельного отзыва судьи
 * (черновик / отправлено / открыто заново).
 */
export type ScoreStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "DRAFT"
  | "SUBMITTED"
  | "REOPENED";

const statusTones: Record<ScoreStatus, "neutral" | "amber" | "green" | "blue"> = {
  NOT_STARTED: "neutral",
  IN_PROGRESS: "amber",
  COMPLETE: "green",
  DRAFT: "amber",
  SUBMITTED: "green",
  REOPENED: "blue",
};

export default function ScoreStatusBadge({
  status,
  className,
}: {
  status: ScoreStatus;
  className?: string;
}) {
  return (
    <DashboardBadge tone={statusTones[status]} className={className}>
      {adminT.statuses[status] ?? status}
    </DashboardBadge>
  );
}

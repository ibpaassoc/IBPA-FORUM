"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ScoreStatusBadgeProps = {
  status: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED" | "IN_PROGRESS" | "COMPLETE";
};

const statusStyles: Record<ScoreStatusBadgeProps["status"], string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700 border-slate-200",
  DRAFT: "bg-amber-100 text-amber-900 border-amber-300",
  SUBMITTED: "bg-emerald-100 text-emerald-900 border-emerald-300",
  REOPENED: "bg-blue-100 text-blue-900 border-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-900 border-yellow-300",
  COMPLETE: "bg-emerald-100 text-emerald-900 border-emerald-300",
};

export default function ScoreStatusBadge({ status }: ScoreStatusBadgeProps) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[status]}`}
    >
      {t.statuses[status]}
    </span>
  );
}

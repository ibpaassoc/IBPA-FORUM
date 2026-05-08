"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PAYMENT_PENDING: "bg-amber-100 text-amber-900 border-amber-300",
  SUBMITTED: "bg-blue-50 text-blue-900 border-blue-200",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-900 border-yellow-300",
  APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-300",
  REJECTED: "bg-red-100 text-red-900 border-red-300",
  PAID: "bg-cyan-100 text-cyan-900 border-cyan-300",
} as const;

export default function ApplicationStatusBadge({
  status,
}: {
  status: keyof typeof statusStyles;
}) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[status]}`}
    >
      {t.statuses[status]}
    </span>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const paymentStatusStyles = {
  PENDING: "bg-blue-50 text-blue-900 border-blue-200",
  PAID: "bg-emerald-100 text-emerald-900 border-emerald-300",
  FAILED: "bg-red-100 text-red-900 border-red-300",
  EXPIRED: "bg-orange-100 text-orange-900 border-orange-300",
  REFUNDED: "bg-slate-100 text-slate-700 border-slate-200",
} as const;

export default function PaymentStatusBadge({
  status,
}: {
  status: keyof typeof paymentStatusStyles;
}) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${paymentStatusStyles[status]}`}
    >
      {t.statuses[status]}
    </span>
  );
}

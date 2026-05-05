"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const statusStyles = {
  DRAFT: "bg-white/5 text-white/65 border-white/10",
  PAYMENT_PENDING: "bg-[#3c3214]/35 text-[#f1d98a] border-[#d8c27a]/30",
  SUBMITTED: "bg-white/8 text-white/85 border-white/12",
  UNDER_REVIEW: "bg-[#7a5a14]/25 text-[#f1d98a] border-[#d8c27a]/35",
  APPROVED: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  REJECTED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
  PAID: "bg-[#0f4d5d]/45 text-[#95dfea] border-[#4196aa]/45",
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

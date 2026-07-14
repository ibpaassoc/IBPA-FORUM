"use client";

import { Gauge, PenLine, Send, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { DashboardStagger, MetricCard } from "@/shared/components/admin/DashboardUI";

export default function ApplicantStats({
  total,
  drafts,
  submitted,
  overallCompletion,
}: {
  total: number;
  drafts: number;
  submitted: number;
  overallCompletion: number;
}) {
  const { t } = useLanguage();
  const stats = t.account.stats;
  return (
    <DashboardStagger className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard
        label={stats.purchased}
        value={total}
        detail={stats.purchasedDetail}
        icon={ShoppingBag}
        accent="blue"
      />
      <MetricCard
        label={stats.drafts}
        value={drafts}
        detail={stats.draftsDetail}
        icon={PenLine}
        accent="amber"
      />
      <MetricCard
        label={stats.submitted}
        value={submitted}
        detail={stats.submittedDetail}
        icon={Send}
        accent="green"
      />
      <MetricCard
        label={stats.completion}
        value={`${overallCompletion}%`}
        detail={stats.completionDetail}
        icon={Gauge}
        accent="blue"
      />
    </DashboardStagger>
  );
}

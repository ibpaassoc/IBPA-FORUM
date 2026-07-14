"use client";

import { Gauge, PenLine, Send, ShoppingBag } from "lucide-react";
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
  return (
    <DashboardStagger className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard
        label="Purchased"
        value={total}
        detail="Paid nominations in your account"
        icon={ShoppingBag}
        accent="blue"
      />
      <MetricCard
        label="Drafts"
        value={drafts}
        detail="Saved progress, not visible to judges"
        icon={PenLine}
        accent="amber"
      />
      <MetricCard
        label="Submitted"
        value={submitted}
        detail="Visible to the jury"
        icon={Send}
        accent="green"
      />
      <MetricCard
        label="Completion"
        value={`${overallCompletion}%`}
        detail="Average across nominations"
        icon={Gauge}
        accent="blue"
      />
    </DashboardStagger>
  );
}

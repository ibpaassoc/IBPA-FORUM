"use client";

import { CheckCircle2, ClipboardList, Clock3, FilePenLine } from "lucide-react";
import { MetricCard } from "@/shared/components/admin/DashboardUI";

export default function JuryStats({
  assigned,
  notStarted,
  inProgress,
  completed,
}: {
  assigned: number;
  notStarted: number;
  inProgress: number;
  completed: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard label="Assigned" value={assigned} detail="Eligible nominations" icon={ClipboardList} accent="blue" />
      <MetricCard label="Not started" value={notStarted} detail="Ready to review" icon={Clock3} accent="blue" />
      <MetricCard label="In progress" value={inProgress} detail="Drafts saved" icon={FilePenLine} accent="amber" />
      <MetricCard label="Completed" value={completed} detail="Final reviews" icon={CheckCircle2} accent="green" />
    </div>
  );
}

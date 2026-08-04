"use client";

import { ClipboardList, Mail, Scale, Shapes, Sparkles, Ticket, UsersRound } from "lucide-react";
import { MetricCard } from "@/shared/components/admin/DashboardUI";

type TestDashboardMetricsProps = {
  counts: {
    applicants: number;
    jury: number;
    nominations: number;
    emails: number;
    tickets: number;
    reviews: number;
    all: number;
  };
};

export function TestDashboardMetrics({ counts }: TestDashboardMetricsProps) {
  const metrics = [
    ["Applicant accounts", counts.applicants, UsersRound],
    ["Jury accounts", counts.jury, Scale],
    ["Nominations", counts.nominations, ClipboardList],
    ["Emails", counts.emails, Mail],
    ["Tickets", counts.tickets, Ticket],
    ["Reviews", counts.reviews, Shapes],
    ["All test creations", counts.all, Sparkles],
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label, value, Icon]) => (
        <MetricCard key={label} label={label} value={value} icon={Icon} />
      ))}
    </section>
  );
}

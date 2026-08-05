"use client";

import type { ComponentType } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Gauge, PenLine, Send, ShoppingBag } from "lucide-react";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard } from "@/shared/components/admin/DashboardUI";

const ease = PUBLIC_MOTION_EASE;

type StatIcon = ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  "aria-hidden"?: boolean;
}>;

function SummaryProgressBar({ value, label }: { value: number; label: string }) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${clamped}%`}
      className="h-2.5 overflow-hidden rounded-full bg-[rgba(3,2,19,0.08)]"
    >
      {shouldReduceMotion ? (
        <div
          className="h-full rounded-full bg-[var(--color-blue)]"
          style={{ width: `${clamped}%` }}
        />
      ) : (
        <motion.div
          className="h-full rounded-full bg-[var(--color-blue)]"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.1, ease, delay: 0.2 }}
        />
      )}
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: StatIcon;
  label: string;
  value: string | number;
  tone: "blue" | "green";
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-4 text-center sm:flex-row sm:gap-3 sm:px-4 sm:text-left lg:px-5">
      <span
        className={clsx(
          "flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10",
          tone === "green"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-[var(--color-blue-wash)] text-[var(--color-blue)]",
        )}
      >
        <Icon aria-hidden size={17} strokeWidth={1.8} />
      </span>
      <div className="flex min-w-0 flex-col-reverse gap-0.5 sm:flex-col">
        <p className="text-[0.56rem] font-semibold uppercase leading-tight tracking-[0.14em] text-[var(--color-ink-soft)] sm:text-[0.6rem]">
          {label}
        </p>
        <p className="font-[var(--font-title-family)] text-[1.5rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)] sm:text-[1.75rem]">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Single compact summary surface for the applicant overview: overall progress
 * and the submission deadline share the top row, the four account statistics
 * sit underneath. Replaces the former hero + separate metric grid.
 */
export default function ApplicantSummary({
  overallCompletion,
  purchased,
  drafts,
  submitted,
  deadlineMonthLabel,
  deadlineDayLabel,
  daysRemaining,
  closed,
}: {
  overallCompletion: number;
  purchased: number;
  drafts: number;
  submitted: number;
  deadlineMonthLabel: string;
  deadlineDayLabel: string;
  daysRemaining: number;
  closed: boolean;
}) {
  const { t } = useLanguage();
  const ov = t.account.overview;
  const stats = t.account.stats;

  return (
    <GlassCard className="p-0">
      <div className="flex items-stretch">
        <div className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
            {ov.overallProgress}
          </p>
          <p className="mt-2 font-[var(--font-title-family)] text-[clamp(2.2rem,6vw,3.2rem)] font-light leading-none tracking-[-0.035em] text-[var(--color-ink)]">
            {overallCompletion}
            <span className="text-[0.45em] text-[var(--color-ink-soft)]">%</span>
          </p>
          <div className="mt-3 sm:mt-4">
            <SummaryProgressBar value={overallCompletion} label={ov.overallProgress} />
          </div>
        </div>

        <div className="flex w-[7.25rem] shrink-0 flex-col items-center justify-center gap-1 border-l border-[rgba(37,42,45,0.08)] px-3 py-4 text-center sm:w-[10rem] sm:px-5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)] sm:size-10">
            <CalendarDays aria-hidden size={17} strokeWidth={1.8} />
          </span>
          <p className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)] sm:text-[0.62rem]">
            {ov.deadline}
          </p>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
            {deadlineMonthLabel}
          </p>
          <p className="font-[var(--font-title-family)] text-[1.9rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)] sm:text-[2.3rem]">
            {deadlineDayLabel}
          </p>
          <p className="text-[0.72rem] leading-tight text-[var(--color-ink-soft)] sm:text-[0.8rem]">
            {closed ? ov.closedShort : `${daysRemaining} ${ov.daysWord}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-[rgba(37,42,45,0.08)] border-t border-[rgba(37,42,45,0.08)]">
        <SummaryStat icon={ShoppingBag} label={stats.purchased} value={purchased} tone="blue" />
        <SummaryStat icon={PenLine} label={stats.drafts} value={drafts} tone="blue" />
        <SummaryStat icon={Send} label={stats.submitted} value={submitted} tone="green" />
        <SummaryStat
          icon={Gauge}
          label={stats.completion}
          value={`${overallCompletion}%`}
          tone="blue"
        />
      </div>
    </GlassCard>
  );
}

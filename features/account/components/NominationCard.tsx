"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import {
  missingFieldsLabel,
  nominationActionLabel,
  nominationStatusLabel,
  nominationTone,
  type NominationCardData,
  type NominationTone,
} from "@/features/account/components/nomination-presentation";

const ease = PUBLIC_MOTION_EASE;

const badgeToneClasses: Record<NominationTone, string> = {
  blue: "border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[#356f98]",
  orange: "border-amber-200 bg-amber-50 text-amber-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  gray: "border-[rgba(37,42,45,0.12)] bg-white/78 text-[var(--color-ink-soft)]",
};

const barToneClasses: Record<NominationTone, string> = {
  blue: "bg-[var(--color-blue)]",
  orange: "bg-amber-400",
  green: "bg-emerald-500",
  gray: "bg-[rgba(37,42,45,0.28)]",
};

export function NominationStatusBadge({
  tone,
  children,
}: {
  tone: NominationTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.11em]",
        badgeToneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

export function NominationProgressBar({
  value,
  tone,
  className,
}: {
  value: number;
  tone: NominationTone;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <div className={clsx("min-w-0", className)}>
      <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        <span>Progress</span>
        <span className="text-[var(--color-ink)]">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Nomination ${clamped}% complete`}
        className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(3,2,19,0.08)]"
      >
        {shouldReduceMotion ? (
          <div className={clsx("h-full rounded-full", barToneClasses[tone])} style={{ width: `${clamped}%` }} />
        ) : (
          <motion.div
            className={clsx("h-full rounded-full", barToneClasses[tone])}
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
          />
        )}
      </div>
    </div>
  );
}

export default function NominationCard({ nomination }: { nomination: NominationCardData }) {
  const shouldReduceMotion = useReducedMotion();
  const tone = nominationTone(nomination);

  return (
    <motion.article
      className="relative overflow-hidden rounded-[28px] border border-[rgba(114,160,193,0.18)] bg-white/76 p-4 shadow-[0_22px_70px_rgba(37,42,45,0.075)] backdrop-blur-2xl md:p-5"
      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.004 }}
      transition={{ duration: 0.45, ease }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-60">
          <h3 className="font-[var(--font-title-family)] text-[1.45rem] font-light leading-snug text-[var(--color-ink)]">
            {nomination.awardName}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            {nomination.categoryName} · Updated {nomination.updatedAtLabel}
          </p>
        </div>
        <NominationStatusBadge tone={tone}>
          {nominationStatusLabel(nomination)}
        </NominationStatusBadge>
      </div>

      <div className="mt-4">
        <NominationProgressBar value={nomination.completionPercentage} tone={tone} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.78rem] leading-5 text-[var(--color-ink-soft)]">
          {missingFieldsLabel(nomination.missingRequiredCount)}
        </p>
        <Link
          href={`/account/applicant/nominations/${nomination.id}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
        >
          {nominationActionLabel(nomination)}
          <ArrowRight aria-hidden size={15} />
        </Link>
      </div>
    </motion.article>
  );
}

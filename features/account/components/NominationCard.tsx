"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
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
  const { t } = useLanguage();
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <div className={clsx("min-w-0", className)}>
      <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        <span>{t.account.card.progress}</span>
        <span className="text-[var(--color-ink)]">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t.account.card.progress}: ${clamped}%`}
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

/**
 * Nomination summary card. The whole card is a single link so the row is
 * comfortably tappable on phones, while the action pill keeps the desktop
 * "Start / Continue / View" affordance visible.
 */
export default function NominationCard({ nomination }: { nomination: NominationCardData }) {
  const { t } = useLanguage();
  const card = t.account.card;
  const tone = nominationTone(nomination);
  const statusLabel = nomination.locked
    ? t.account.badges.locked
    : t.account.statuses[nomination.status] ?? nomination.status.toLowerCase().replaceAll("_", " ");
  const actionLabel =
    nomination.locked ||
    nomination.status === "SUBMITTED" ||
    nomination.status === "UNDER_REVIEW"
      ? card.view
      : nomination.completionPercentage === 0
        ? card.start
        : card.continue;

  return (
    <Link
      href={`/account/applicant/nominations/${nomination.id}`}
      className="group relative block overflow-hidden rounded-[26px] border border-[rgba(114,160,193,0.18)] bg-white/76 p-4 shadow-[0_18px_54px_rgba(37,42,45,0.06)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[var(--color-blue)] hover:shadow-[0_24px_66px_rgba(37,42,45,0.09)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-52">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
            {nomination.categoryName}
          </p>
          <h3 className="mt-1 font-[var(--font-title-family)] text-[1.3rem] font-light leading-snug text-[var(--color-ink)] sm:text-[1.5rem]">
            {nomination.awardName}
          </h3>
          <p className="mt-1 text-[0.8rem] text-[var(--color-ink-soft)]">
            {card.updated} {nomination.updatedAtLabel}
          </p>
        </div>
        <NominationStatusBadge tone={tone}>{statusLabel}</NominationStatusBadge>
      </div>

      <div className="mt-4">
        <NominationProgressBar value={nomination.completionPercentage} tone={tone} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-[0.78rem] leading-5 text-[var(--color-ink-soft)]">
          {nomination.missingRequiredCount === 0
            ? card.allComplete
            : `${card.missingLabel} ${nomination.missingRequiredCount}`}
        </p>
        <span className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-4 text-[0.7rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_10px_24px_rgba(37,42,45,0.05)] transition duration-300 group-hover:border-[var(--color-blue)] group-hover:bg-[var(--color-blue-wash)]">
          {actionLabel}
          <ArrowRight
            aria-hidden
            size={15}
            className="transition duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </span>
      </div>
    </Link>
  );
}

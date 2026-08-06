"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { JuryNominationListItem } from "@/features/jury/server/reviews";
import {
  isFinalReviewStatus,
  juryBadgeToneClasses,
  juryBarToneClasses,
  juryStatusTone,
} from "@/features/account/components/jury/jury-presentation";

const ease = PUBLIC_MOTION_EASE;

/**
 * Compact queue card. The whole card is one link so the row stays comfortably
 * tappable on phones, while the action pill keeps the desktop
 * "Start / Continue / View" affordance visible.
 */
export default function JuryNominationCard({
  nomination,
}: {
  nomination: JuryNominationListItem;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const card = t.account.jury.card;
  const complete = isFinalReviewStatus(nomination.reviewStatus);
  const tone = juryStatusTone(nomination.reviewStatus);
  const statusLabel =
    t.account.jury.statuses[nomination.reviewStatus] ?? nomination.reviewStatus;
  const progress = Math.max(0, Math.min(100, nomination.reviewProgress));
  const actionLabel = complete
    ? card.view
    : nomination.reviewStatus === "IN_PROGRESS"
      ? card.continue
      : card.start;

  return (
    <Link
      href={`/account/jury/nominations/${nomination.id}`}
      className="group relative block overflow-hidden rounded-[26px] border border-[rgba(114,160,193,0.18)] bg-white/76 p-4 shadow-[0_18px_54px_rgba(37,42,45,0.06)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[var(--color-blue)] hover:shadow-[0_24px_66px_rgba(37,42,45,0.09)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-52">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
            {nomination.category.name}
          </p>
          <h3 className="mt-1 font-[var(--font-title-family)] text-[1.3rem] font-light leading-snug text-[var(--color-ink)] sm:text-[1.5rem]">
            {nomination.award.name}
          </h3>
        </div>
        <span
          className={clsx(
            "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.11em]",
            juryBadgeToneClasses[tone],
          )}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {card.nominee}
      </p>
      <p className="mt-0.5 truncate text-[0.95rem] text-[var(--color-ink)]">
        {nomination.applicantName}
      </p>

      <div className="mt-4 min-w-0">
        <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          <span>{card.reviewed}</span>
          <span className="text-[var(--color-ink)]">
            {complete && nomination.totalScore !== null
              ? `${card.score} ${nomination.totalScore} / ${nomination.maximumScore}`
              : `${progress}%`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${card.reviewed}: ${progress}%`}
          className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(3,2,19,0.08)]"
        >
          {shouldReduceMotion ? (
            <div
              className={clsx("h-full rounded-full", juryBarToneClasses[tone])}
              style={{ width: `${progress}%` }}
            />
          ) : (
            <motion.div
              className={clsx("h-full rounded-full", juryBarToneClasses[tone])}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease, delay: 0.15 }}
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
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

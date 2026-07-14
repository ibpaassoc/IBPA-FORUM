"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, FileText, Plus } from "lucide-react";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PremiumButton } from "@/shared/components/admin/DashboardUI";

const ease = PUBLIC_MOTION_EASE;

function HeroProgressBar({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}%`}
      className="h-2.5 overflow-hidden rounded-full bg-[rgba(3,2,19,0.08)]"
    >
      {shouldReduceMotion ? (
        <div className="h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${clamped}%` }} />
      ) : (
        <motion.div
          className="h-full rounded-full bg-[var(--color-blue)]"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.1, ease, delay: 0.25 }}
        />
      )}
    </div>
  );
}

export default function ApplicantHero({
  overallCompletion,
  remainingCount,
  daysRemaining,
  deadlineLabel,
  closedAtLabel,
}: {
  overallCompletion: number;
  remainingCount: number;
  daysRemaining: number;
  deadlineLabel: string;
  closedAtLabel: string | null;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const ov = t.account.overview;
  const Wrapper = shouldReduceMotion ? "section" : motion.section;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { duration: 0.55, ease },
      };

  return (
    <Wrapper
      className="relative overflow-hidden rounded-[32px] border border-[rgba(114,160,193,0.2)] bg-white/78 p-5 shadow-[0_28px_90px_rgba(37,42,45,0.09)] backdrop-blur-2xl sm:p-7 lg:p-9"
      {...motionProps}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[rgba(185,217,235,0.3)] blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 lg:max-w-[34rem] xl:max-w-[42rem]">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink-soft)]">
            {ov.eyebrow}
          </p>
          <h1 className="mt-2 font-[var(--font-title-family)] text-[clamp(2rem,4.6vw,3.4rem)] font-light leading-[1.04] tracking-[-0.02em] text-[var(--color-ink)]">
            {closedAtLabel ? ov.closedTitle : ov.openTitle}
          </h1>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
                {ov.overallProgress}
              </p>
              <p className="font-[var(--font-title-family)] text-3xl font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
                {overallCompletion}
                <span className="text-lg text-[var(--color-ink-soft)]">%</span>
              </p>
            </div>
            <div className="mt-3">
              <HeroProgressBar value={overallCompletion} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-2">
              <FileText aria-hidden size={15} className="text-[var(--color-blue)]" />
              {remainingCount === 0
                ? ov.allSubmitted
                : `${ov.remainingLabel} ${remainingCount}`}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden size={15} className="text-[var(--color-blue)]" />
              {closedAtLabel
                ? `${ov.closedPrefix} ${closedAtLabel}`
                : `${ov.closesPrefix} ${deadlineLabel}`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-5 lg:items-end">
          {closedAtLabel ? null : (
            <div className="lg:text-right">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
                {ov.daysRemaining}
              </p>
              <p className="mt-1 font-[var(--font-title-family)] text-[clamp(2.6rem,5vw,4rem)] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
                {daysRemaining}
                <span className="ml-2 text-lg text-[var(--color-ink-soft)]">{ov.daysWord}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                {ov.untilClose}
              </p>
            </div>
          )}
          <PremiumButton href="/account/applicant/add-nomination">
            <Plus size={16} /> {ov.addNominations}
          </PremiumButton>
        </div>
      </div>
    </Wrapper>
  );
}

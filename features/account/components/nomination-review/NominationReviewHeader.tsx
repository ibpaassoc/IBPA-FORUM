"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/shared/components/admin/DashboardUI";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

const ease = PUBLIC_MOTION_EASE;

type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red";

/**
 * Page header for the nomination workspace. The nomination name is the main
 * heading; category, payment and review status appear here exactly once.
 */
export default function NominationReviewHeader({
  categoryName,
  awardName,
  statusLabel,
  statusTone,
  paidLabel,
  paidTone,
  backHref,
  backLabel,
  description,
}: {
  categoryName: string;
  awardName: string;
  statusLabel: string;
  statusTone: BadgeTone;
  paidLabel: string;
  paidTone: BadgeTone;
  backHref: string;
  backLabel: string;
  description: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Wrapper = shouldReduceMotion ? "header" : motion.header;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease },
      };

  return (
    <Wrapper
      className="relative overflow-hidden rounded-[30px] border border-[rgba(114,160,193,0.2)] bg-white/76 p-5 shadow-[0_22px_70px_rgba(37,42,45,0.075),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl md:p-7"
      {...motionProps}
    >
      <div className="pointer-events-none absolute -left-24 -top-32 size-[24rem] rounded-full bg-[rgba(185,217,235,0.32)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-[-10rem] size-[20rem] rounded-full bg-[rgba(114,160,193,0.12)] blur-3xl" />

      <div className="relative">
        <Link
          href={backHref}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/78 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]"
        >
          <ArrowLeft aria-hidden size={14} /> {backLabel}
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]">
              {categoryName}
            </p>
            <h1 className="mt-2 max-w-[22ch] font-[var(--font-title-family)] text-[clamp(1.9rem,4.5vw,3.2rem)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
              {awardName}
            </h1>
            <p className="mt-3 max-w-2xl text-[0.9rem] leading-[1.7] text-[var(--color-ink-soft)]">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <StatusBadge tone={paidTone}>{paidLabel}</StatusBadge>
            <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

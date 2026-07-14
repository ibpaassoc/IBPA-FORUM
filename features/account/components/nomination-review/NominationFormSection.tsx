"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

/**
 * One logical group of nomination form fields inside its own glass panel:
 * compact icon, title, short description, then the fields grid.
 */
export default function NominationFormSection({
  icon: Icon,
  title,
  description,
  meta,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const Wrapper = shouldReduceMotion ? "section" : motion.section;
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.4, ease: PUBLIC_MOTION_EASE },
      };

  return (
    <Wrapper
      className="relative overflow-hidden rounded-[28px] border border-[rgba(114,160,193,0.2)] bg-white/74 p-4 shadow-[0_22px_70px_rgba(37,42,45,0.07),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl md:p-6"
      {...motionProps}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-[rgba(185,217,235,0.24)] blur-2xl" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(114,160,193,0.16)] pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[var(--color-blue)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <Icon aria-hidden size={17} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="font-[var(--font-title-family)] text-[1.35rem] font-light leading-tight text-[var(--color-ink)]">
                {title}
              </h2>
              <p className="mt-1 text-[0.82rem] leading-[1.6] text-[var(--color-ink-soft)]">
                {description}
              </p>
            </div>
          </div>
          {meta ? <div className="shrink-0">{meta}</div> : null}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
      </div>
    </Wrapper>
  );
}

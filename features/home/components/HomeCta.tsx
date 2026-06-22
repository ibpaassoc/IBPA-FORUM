"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal, GlassCard, OvalBlob } from "@/shared/components/public";
import { Ticket, Trophy, Star } from "lucide-react";
import BuyTicketsButton from "@/features/tickets/components/BuyTicketsButton";

export default function HomeCta() {
  const { t } = useLanguage();
  const fc = t.home.finalCta;

  return (
    <section className="section-rhythm-loose relative overflow-hidden bg-white">
      {/* Decorative organic blobs — ambient light */}
      <OvalBlob size="lg" opacity={0.24} animate className="right-[-10%] top-[-20%] z-0" />
      <OvalBlob size="md" opacity={0.18} animate className="bottom-[-10%] left-[-8%] z-0" color="var(--color-blue-soft)" />

      <div className="page-section relative z-10 flex justify-center">
        <Reveal className="w-full max-w-2xl">
          {/* Floating glass island */}
          <GlassCard
            tone="blue"
            className="px-[clamp(2rem,4vw,3.5rem)] py-[clamp(2.5rem,5vw,4rem)] text-center"
          >
            <p className="mb-[var(--space-md)] text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              {fc.eyebrow}
            </p>

            <h2 className="mx-auto max-w-lg font-[var(--font-title-family)] text-[clamp(2rem,5vw,3.8rem)] font-light leading-[1.06] text-[var(--color-ink)]">
              {fc.title}
            </h2>

            <div className="mx-auto mt-[var(--space-xl)] flex max-w-xl flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
              <BuyTicketsButton className="ibpa-button ibpa-button-blue flex items-center gap-2">
                <Ticket size={16} strokeWidth={1.5} />
                {fc.buyTicket}
              </BuyTicketsButton>
              <Link
                href="/apply"
                className="ibpa-button ibpa-button-blue flex items-center gap-2"
              >
                <Trophy size={16} strokeWidth={1.5} />
                {fc.applyAward}
              </Link>
              <Link
                href="/jury"
                className="ibpa-button ibpa-button-ghost flex items-center gap-2"
              >
                <Star size={16} strokeWidth={1.5} />
                {fc.registerJudge}
              </Link>
            </div>

            {/* Bottom decorative rule */}
            <div className="mx-auto mt-[var(--space-xl)] flex items-center justify-center gap-4 opacity-30">
              <div className="h-px w-12 bg-[var(--color-blue)]" />
              <span className="font-[var(--font-title-family)] text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-ink)]">
                IBPA 2026
              </span>
              <div className="h-px w-12 bg-[var(--color-blue)]" />
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

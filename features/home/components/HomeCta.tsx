"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { Ticket, Trophy, Star } from "lucide-react";
import BuyTicketsButton from "@/features/tickets/components/BuyTicketsButton";

export default function HomeCta() {
  const { t } = useLanguage();
  const fc = t.home.finalCta;

  return (
    <section className="section-rhythm-loose relative overflow-hidden bg-[var(--color-off-white)]">
      {/* Subtle editorial background image */}
      <div className="absolute inset-0 opacity-[0.07]">
        <Image
          src="/images/curated/home_photo_break.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          aria-hidden="true"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-off-white)]/95 to-[var(--color-off-white)]" />

      <div className="page-section relative text-center">
        <Reveal>
          <p className="mb-[var(--space-md)] text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
            {fc.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mx-auto max-w-3xl font-[var(--font-title-family)] text-[clamp(2rem,5vw,4rem)] font-light leading-[1.06] text-[var(--color-ink)]">
            {fc.title}
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mx-auto mt-[var(--space-xl)] flex max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
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
        </Reveal>

        {/* Bottom decorative rule */}
        <Reveal delay={0.26}>
          <div className="mx-auto mt-[var(--space-2xl)] flex items-center justify-center gap-4 opacity-30">
            <div className="h-px w-16 bg-[var(--color-blue)]" />
            <span className="font-[var(--font-title-family)] text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-ink)]">
              IBPA 2026
            </span>
            <div className="h-px w-16 bg-[var(--color-blue)]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

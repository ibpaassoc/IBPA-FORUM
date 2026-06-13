"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";
import { Trophy, Star, CheckCircle } from "lucide-react";

export default function HomeParticipation() {
  const { t } = useLanguage();
  const p = t.home.participation;
  const [tier, setTier] = useState<"ibpa" | "standard">("ibpa");

  const awardPrice =
    tier === "ibpa"
      ? PRICING.awardParticipation.ibpaMembers.oneNomination
      : PRICING.awardParticipation.nonMembers.oneNomination;

  const judgePrice =
    tier === "ibpa"
      ? PRICING.judgeRegistration.ibpaMembers
      : PRICING.judgeRegistration.standard;

  return (
    <section className="section-rhythm-loose bg-[var(--surface)]">
      <div className="page-section">
        {/* Header row + toggle */}
        <div className="mb-[var(--space-xl)] flex flex-col gap-[var(--space-md)] sm:flex-row sm:items-center sm:justify-between">
          <Reveal>
            <p className="page-eyebrow">{p.eyebrow}</p>
          </Reveal>

          <Reveal delay={0.04}>
            <div
              role="group"
              aria-label="Membership tier"
              className="flex items-center rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-muted)] p-1"
            >
              {(["ibpa", "standard"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`rounded-[var(--radius-pill)] px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                    tier === t
                      ? "bg-[var(--color-ink)] text-white shadow-sm"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {t === "ibpa" ? "IBPA Member" : "Standard"}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr]">

          {/* ── Forum Tickets — dominant card ── */}
          <Reveal delay={0.05} className="md:row-span-2">
            <Link
              href="/tickets"
              className="group relative flex h-full min-h-[480px] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)] lg:min-h-[560px]"
            >
              <Image
                src="/images/events/HomeHero.jpg"
                alt="Forum Tickets"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 700px"
                className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/60 to-transparent" />

              <div className="relative flex h-full flex-col justify-between p-[var(--space-lg)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-sm)] border border-white/20 bg-white/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/80">
                    Most Popular
                  </span>
                  <Star size={18} className="text-[var(--color-blue-soft)] opacity-70" strokeWidth={1.5} />
                </div>

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue-soft)]">
                    {p.tickets.label}
                  </p>
                  <h3 className="mt-2 font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.05] text-white">
                    Starting from
                    <br />
                    <span className="text-[clamp(2.4rem,5vw,4rem)] font-medium">
                      {PRICING.forumTickets.startingFrom}
                    </span>
                  </h3>

                  <div className="mt-[var(--space-md)] flex flex-wrap gap-x-4 gap-y-2">
                    {["1 Day Pass", "2 Day Pass", "Gala Dinner"].map((item) => (
                      <span key={item} className="flex items-center gap-1.5 text-[0.82rem] text-white/70">
                        <CheckCircle size={13} strokeWidth={2} className="text-[var(--color-blue-soft)]" />
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-[var(--space-lg)]">
                    <span className="ibpa-button ibpa-button-white inline-flex">
                      {p.tickets.cta}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>

          {/* ── Award Participation — dark card ── */}
          <Reveal delay={0.1}>
            <Link
              href="/apply"
              className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)] p-[var(--space-lg)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="mb-[var(--space-md)] flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/12 bg-white/6">
                  <Trophy size={18} className="text-white/50" strokeWidth={1.5} />
                </div>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/25">
                  {tier === "ibpa" ? "IBPA Members" : "Standard"}
                </span>
              </div>

              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                {p.award.label}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[0.72rem] text-white/35">Starting from</span>
                <span className="font-[var(--font-title-family)] text-[2.2rem] font-light leading-none text-white transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                  {awardPrice}
                </span>
              </div>

              <p className="mt-3 flex-1 text-[0.87rem] leading-[1.65] text-white/50">
                {p.award.description}
              </p>

              <div className="mt-[var(--space-lg)]">
                <span className="ibpa-button ibpa-button-white inline-flex text-[0.72rem]">
                  {p.award.cta}
                </span>
              </div>
            </Link>
          </Reveal>

          {/* ── Judge Registration — dark card ── */}
          <Reveal delay={0.16}>
            <Link
              href="/jury"
              className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)] p-[var(--space-lg)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="mb-[var(--space-md)] flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/12 bg-white/6">
                  <Star size={18} className="text-white/50" strokeWidth={1.5} />
                </div>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/25">
                  {tier === "ibpa" ? "IBPA Members" : "Standard"}
                </span>
              </div>

              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/40 transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                {p.judge.label}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[0.72rem] text-white/35">Starting from</span>
                <span className="font-[var(--font-title-family)] text-[2.2rem] font-light leading-none text-white transition-colors duration-300 group-hover:text-[var(--color-blue)]">
                  {judgePrice}
                </span>
              </div>

              <p className="mt-3 flex-1 text-[0.87rem] leading-[1.65] text-white/50">
                {p.judge.description}
              </p>

              <div className="mt-[var(--space-lg)]">
                <span className="ibpa-button ibpa-button-white inline-flex text-[0.72rem]">
                  {p.judge.cta}
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

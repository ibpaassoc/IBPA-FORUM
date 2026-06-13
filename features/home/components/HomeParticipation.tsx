"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";
import { Trophy, Star, CheckCircle } from "lucide-react";

export default function HomeParticipation() {
  const { t } = useLanguage();
  const p = t.home.participation;

  return (
    <section className="section-rhythm-loose bg-[var(--surface)]">
      <div className="page-section">
        <Reveal>
          <p className="page-eyebrow mb-[var(--space-lg)]">{p.eyebrow}</p>
        </Reveal>

        {/* Asymmetric participation grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr]">

          {/* ── Forum Tickets — dominant card ── */}
          <Reveal delay={0.05} className="md:row-span-2">
            <Link
              href="/tickets"
              className="group relative flex h-full min-h-[480px] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)] lg:min-h-[560px]"
            >
              {/* Background image */}
              <Image
                src="/images/events/HomeHero.jpg"
                alt="Forum Tickets"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 700px"
                className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/60 to-transparent" />

              {/* Content */}
              <div className="relative flex h-full flex-col justify-between p-[var(--space-lg)]">
                {/* Top badge */}
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-sm)] border border-white/20 bg-white/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/80">
                    Most Popular
                  </span>
                  <Star size={18} className="text-[var(--color-blue-soft)] opacity-70" strokeWidth={1.5} />
                </div>

                {/* Bottom content */}
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

                  {/* Feature list */}
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

          {/* ── Award Participation card ── */}
          <Reveal delay={0.1}>
            <Link
              href="/apply"
              className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-tint)] p-[var(--space-lg)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)] border border-[var(--border-default)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface)]">
                  <Trophy size={20} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                </div>
                {/* Small image */}
                <div className="relative h-16 w-24 overflow-hidden rounded-[var(--radius-sm)]">
                  <Image
                    src="/images/curated/grandprix_editorial.jpg"
                    alt="Award Participation"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-[var(--space-md)] flex-1">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">
                  {p.award.label}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[0.75rem] text-[var(--color-ink-soft)]">Starting from</span>
                  <span className="font-[var(--font-title-family)] text-[2rem] font-light text-[var(--color-ink)]">
                    {PRICING.awardParticipation.startingFrom}
                  </span>
                </div>
                <p className="mt-2 text-[0.88rem] leading-[1.65] text-[var(--color-ink-soft)]">
                  {p.award.description}
                </p>
              </div>

              <div className="mt-[var(--space-md)]">
                <span className="ibpa-button ibpa-button-gold inline-flex">
                  {p.award.cta}
                </span>
              </div>
            </Link>
          </Reveal>

          {/* ── Judge Registration card ── */}
          <Reveal delay={0.16}>
            <Link
              href="/jury"
              className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-tint)] p-[var(--space-lg)] transition-shadow duration-300 hover:shadow-[var(--shadow-md)] border border-[var(--border-default)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface)]">
                  <Star size={20} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                </div>
                <div className="relative h-16 w-24 overflow-hidden rounded-[var(--radius-sm)]">
                  <Image
                    src="/images/curated/jury_editorial.jpg"
                    alt="Judge Registration"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-[var(--space-md)] flex-1">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-hover-accent)]">
                  {p.judge.label}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[0.75rem] text-[var(--color-ink-soft)]">Starting from</span>
                  <span className="font-[var(--font-title-family)] text-[2rem] font-light text-[var(--color-ink)]">
                    {PRICING.judgeRegistration.startingFrom}
                  </span>
                </div>
                <p className="mt-2 text-[0.88rem] leading-[1.65] text-[var(--color-ink-soft)]">
                  {p.judge.description}
                </p>
              </div>

              <div className="mt-[var(--space-md)]">
                <span className="ibpa-button ibpa-button-ghost inline-flex">
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

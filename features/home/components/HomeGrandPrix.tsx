"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";
import { Star } from "lucide-react";

export default function HomeGrandPrix() {
  const { t } = useLanguage();
  const gp = t.home.grandPrixSpotlight;

  return (
    <section className="relative overflow-hidden bg-white" style={{ minHeight: "clamp(560px, 80vh, 860px)" }}>
      {/* Right-side full-bleed background image */}
      <div className="absolute right-0 top-0 hidden h-full w-[52%] lg:block">
        <Image
          src="/images/events/HomeHero.jpg"
          alt="IBPA Grand Prix"
          fill
          sizes="52vw"
          className="object-cover"
          style={{ objectPosition: "60% 20%" }}
        />
        {/* Gradient fade left so text remains readable */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.40)_30%,rgba(255,255,255,0)_60%)]" />
      </div>

      {/* Content — left half */}
      <div className="page-section relative z-10 flex h-full items-center py-[clamp(4rem,8vw,7rem)]">
        <div className="flex max-w-[54%] flex-col gap-[var(--space-lg)] lg:max-w-[48%]">
          {/* Eyebrow */}
          <Reveal>
            <p className="page-eyebrow">{gp.eyebrow}</p>
          </Reveal>

          {/* Title */}
          <Reveal delay={0.08}>
            <h2 className="font-[var(--font-title-family)] text-[clamp(2.2rem,4vw,3.6rem)] font-light leading-[1.04] text-[var(--color-ink)]">
              {gp.title}
            </h2>
          </Reveal>

          {/* Star divider */}
          <Reveal delay={0.14}>
            <div className="flex items-center gap-4">
              <div className="h-px w-10 bg-[var(--color-blue)]/40" />
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={8}
                    className="fill-[var(--color-blue)]/30 text-[var(--color-blue)]/30"
                  />
                ))}
              </div>
              <div className="h-px w-10 bg-[var(--color-blue)]/40" />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="page-copy max-w-md">{gp.description}</p>
          </Reveal>

          {/* Stat cards */}
          <Reveal delay={0.24}>
            <div className="flex flex-wrap gap-3">
              {gp.stats.map((stat) => (
                <GlassCard
                  key={stat.label}
                  tone="blue"
                  hoverLift
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="font-[var(--font-title-family)] text-[1.6rem] font-light leading-none text-[var(--color-ink)]">
                    {stat.value}
                  </span>
                  <span className="text-[0.68rem] uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">
                    {stat.label}
                  </span>
                </GlassCard>
              ))}
            </div>
          </Reveal>

          {/* Buttons */}
          <Reveal delay={0.30}>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2.5 rounded-full bg-black px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-xl transition-all duration-300 hover:scale-[1.04]"
              >
                {gp.cta} <ArrowRight size={15} />
              </Link>
              <Link
                href="/grand-prix"
                className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-transparent px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink)] transition-all duration-300 hover:bg-[var(--color-ink)] hover:text-white"
              >
                {gp.learnMore}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Mobile image (below text on small screens) */}
      <div className="relative mt-8 aspect-[16/9] w-full lg:hidden">
        <Image
          src="/images/events/HomeHero.jpg"
          alt="IBPA Grand Prix"
          fill
          className="object-cover"
          style={{ objectPosition: "60% 20%" }}
          sizes="100vw"
        />
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { Star } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, LandingPrimaryButton, LandingSecondaryButton, Reveal } from "@/shared/components/public";

export default function HomeGrandPrix() {
  const { t } = useLanguage();
  const gp = t.home.grandPrixSpotlight;

  return (
    <section className="relative min-h-[clamp(640px,82vh,900px)] overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
        <Image
          src="/images/winners.png"
          alt="IBPA Grand Prix"
          fill
          priority={false}
          className="object-cover"
          style={{ objectPosition: "63% 20%" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_44%,rgba(255,255,255,0.14)_100%)]" />
        <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.96)_18%,rgba(255,255,255,0.72)_35%,rgba(255,255,255,0.26)_55%,rgba(255,255,255,0)_76%)]" />
        <div className="absolute inset-0 lg:hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.72)_42%,rgba(255,255,255,0.18)_100%)]" />
      </div>

      <div className="page-section relative z-10 flex min-h-[clamp(640px,82vh,900px)] items-center py-[clamp(4rem,8vw,7rem)]">
        <div className="max-w-[560px]">
          <Reveal>
            <p className="page-eyebrow mb-5">{gp.eyebrow}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="max-w-[9ch] font-[var(--font-title-family)] text-[clamp(3.2rem,8vw,6rem)] font-light leading-[0.9] tracking-[-0.035em] text-[var(--color-ink)]">
              {gp.title}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="my-7 flex items-center gap-4">
              <div className="h-px w-12 bg-[var(--color-blue)]/35" />
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={9}
                    className="fill-[var(--color-blue)]/30 text-[var(--color-blue)]/30"
                  />
                ))}
              </div>
              <div className="h-px w-12 bg-[var(--color-blue)]/35" />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="max-w-[34rem] font-[var(--font-body-family)] text-[clamp(1rem,1.25vw,1.16rem)] leading-[1.8] text-[var(--color-ink-soft)]">
              {gp.description}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 grid max-w-[460px] gap-3 sm:grid-cols-2">
              {gp.stats.map((stat) => (
                <GlassCard
                  key={stat.label}
                  tone="blue"
                  hoverLift
                  className="flex items-center gap-3 rounded-[1.15rem] bg-white/48 px-4 py-3 backdrop-blur-2xl"
                >
                  <span className="font-[var(--font-title-family)] text-[1.75rem] font-light leading-none text-[var(--color-ink)]">
                    {stat.value}
                  </span>
                  <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                    {stat.label}
                  </span>
                </GlassCard>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LandingPrimaryButton href="/apply">{gp.cta}</LandingPrimaryButton>
              <LandingSecondaryButton href="/grand-prix">{gp.learnMore}</LandingSecondaryButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

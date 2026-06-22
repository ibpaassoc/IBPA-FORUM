"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, OvalBlob, PremiumSectionHeader } from "@/shared/components/public";
import { Reveal } from "@/shared/components/public";
import { Star } from "lucide-react";

export default function HomeGrandPrix() {
  const { t } = useLanguage();
  const gp = t.home.grandPrixSpotlight;

  return (
    <section
      className="section-rhythm-loose relative overflow-hidden"
      style={{ background: "var(--surface-blue-tint)" }}
    >
      {/* Decorative blob — right side, behind the image */}
      <OvalBlob size="lg" opacity={0.22} className="right-[-15%] top-[-10%] z-0" />

      <div className="page-section relative z-10">
        <div className="grid items-center gap-[var(--space-2xl)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">

          {/* Left — content */}
          <div className="flex flex-col gap-[var(--space-lg)]">
            <PremiumSectionHeader
              eyebrow={gp.eyebrow}
              title={gp.title}
            />

            {/* Star divider */}
            <Reveal delay={0.2}>
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-[var(--color-blue)]/40" />
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      size={9}
                      className="fill-[var(--color-blue)]/30 text-[var(--color-blue)]/30"
                    />
                  ))}
                </div>
                <div className="h-px flex-1 bg-[var(--color-blue)]/40" />
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <p className="page-copy max-w-xl">{gp.description}</p>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/apply" className="ibpa-button ibpa-button-blue">
                  {gp.cta}
                </Link>
                <Link href="/grand-prix" className="ibpa-button ibpa-button-ghost">
                  {gp.learnMore}
                </Link>
              </div>
            </Reveal>

            {/* Glass stat cards */}
            <Reveal delay={0.4}>
              <div className="flex flex-wrap gap-4">
                {gp.stats.map((stat) => (
                  <GlassCard
                    key={stat.label}
                    tone="blue"
                    hoverLift
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span className="font-[var(--font-title-family)] text-[1.8rem] font-light leading-none text-[var(--color-ink)]">
                      {stat.value}
                    </span>
                    <span className="text-[0.7rem] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                      {stat.label}
                    </span>
                  </GlassCard>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — editorial image (desktop only) */}
          <Reveal delay={0.12} y={32} className="hidden lg:block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-glass)] shadow-[var(--shadow-glass-lg)]">
              <Image
                src="/images/events/HomeHero.jpg"
                alt="IBPA Grand Prix"
                fill
                sizes="40vw"
                className="object-cover opacity-[0.55]"
                style={{ objectPosition: "60% 20%" }}
              />
              {/* Gradient tint overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(185,217,235,0.18)_0%,rgba(255,255,255,0.08)_100%)]" />
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

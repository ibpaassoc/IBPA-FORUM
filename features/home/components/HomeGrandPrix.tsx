"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";
import { Star } from "lucide-react";

export default function HomeGrandPrix() {
  const { t } = useLanguage();
  const gp = t.home.grandPrixSpotlight;

  return (
    <section className="section-rhythm-loose relative overflow-hidden bg-[var(--color-blue-wash)]">
      {/* Background image — very subtle */}
      <div className="absolute inset-0">
        <Image
          src="/images/events/DSC01248.jpg"
          alt="Grand Prix"
          fill
          sizes="100vw"
          className="object-cover opacity-8"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-blue-wash)] via-[var(--color-blue-wash)]/90 to-[var(--color-blue-wash)]/60" />
      </div>

      <div className="page-section relative">
        <div className="max-w-2xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-[var(--space-lg)]">
              <Star size={16} className="text-[var(--color-blue)]" strokeWidth={1.5} />
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {gp.eyebrow}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-[var(--font-title-family)] text-[clamp(3rem,8vw,7rem)] font-light leading-[0.92] tracking-[-0.02em] text-[var(--color-ink)]">
              {gp.title}
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="my-[var(--space-lg)] flex items-center gap-4">
              <div className="h-px w-16 bg-[var(--color-blue)]/40" />
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={10}
                    className="fill-[var(--color-blue)]/25 text-[var(--color-blue)]/25"
                  />
                ))}
              </div>
              <div className="h-px flex-1 bg-[var(--color-blue)]/40" />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-[clamp(1rem,1.7vw,1.18rem)] leading-[1.78] text-[var(--color-ink-soft)]">
              {gp.description}
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-[var(--space-xl)] flex flex-wrap items-center gap-4">
              <Link href="/apply" className="ibpa-button ibpa-button-blue">
                {gp.cta}
              </Link>
              <Link href="/grand-prix" className="ibpa-button ibpa-button-ghost">
                {gp.learnMore}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Floating nomination counter */}
        <Reveal delay={0.32} className="mt-[var(--space-2xl)]">
          <div className="flex flex-wrap gap-6">
            {gp.stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-[var(--radius)] border border-[var(--color-blue)]/20 bg-white/70 px-5 py-4 backdrop-blur-sm shadow-[var(--shadow-sm)]">
                <span className="font-[var(--font-title-family)] text-[1.8rem] font-light leading-none text-[var(--color-ink)]">
                  {stat.value}
                </span>
                <span className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

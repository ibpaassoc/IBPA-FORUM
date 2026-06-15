"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function HomeForumOverview() {
  const { t } = useLanguage();
  const f = t.home.forum;

  return (
    <section className="section-rhythm-loose bg-[var(--color-off-white)] overflow-hidden">
      <div className="page-section">
        {/* Top label row */}
        <Reveal>
          <p className="page-eyebrow mb-[var(--space-lg)]">{f.eyebrow}</p>
        </Reveal>

        {/* Asymmetric editorial grid */}
        <div className="grid gap-[var(--space-xl)] lg:grid-cols-[1fr_0.85fr] lg:items-end">
          {/* Left: text column */}
          <div className="flex flex-col justify-end">
            <Reveal delay={0.05}>
              <h2 className="font-[var(--font-title-family)] text-[clamp(2.4rem,6vw,5.2rem)] font-light leading-[0.96] tracking-[-0.02em] text-[var(--color-ink)]">
                {f.title}
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-[var(--space-lg)] flex items-start gap-[var(--space-md)]">
                <div className="mt-1 h-px w-10 shrink-0 bg-[var(--color-hover-accent)]" />
                <p className="max-w-lg text-[clamp(1rem,1.7vw,1.15rem)] leading-[1.78] text-[var(--color-ink-soft)]">
                  {f.description}
                </p>
              </div>
            </Reveal>

            {/* Stat chips */}
            <Reveal delay={0.22}>
              <div className="mt-[var(--space-xl)] flex flex-wrap gap-3">
                {[
                  { value: "11", label: "Award Categories" },
                  { value: "2026", label: "New York, USA" },
                  { value: "3", label: "Event Days" },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface)] px-4 py-2.5"
                  >
                    <span className="font-[var(--font-title-family)] text-[1.1rem] font-medium text-[var(--color-ink)]">
                      {chip.value}
                    </span>
                    <span className="text-[0.74rem] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                      {chip.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: large editorial image */}
          <Reveal delay={0.1} y={32}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] lg:aspect-[3/4]">
              <Image
                src="/images/curated/home_hero_support.jpg"
                alt="IBPA BEAUTY AWARD 2026"
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover"
                priority={false}
              />
              {/* Floating label card */}
              <div className="absolute bottom-[var(--space-md)] left-[var(--space-md)] rounded-[var(--radius)] bg-[var(--color-ink)]/85 px-4 py-3 backdrop-blur-sm">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-blue-soft)]">
                  Official Event
                </p>
                <p className="mt-0.5 font-[var(--font-title-family)] text-[0.95rem] text-white">
                  IBPA BEAUTY AWARD 2026
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

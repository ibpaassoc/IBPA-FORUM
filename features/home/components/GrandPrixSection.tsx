"use client";

import Link from "next/link";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function GrandPrixSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--color-white)]">
      <div className="mx-auto grid max-w-[var(--content-width)] gap-[var(--space-xl)] px-[var(--page-gutter)] page-section-pad lg:grid-cols-[1fr_1.02fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="page-eyebrow">{t.home.grandPrix.label}</p>

          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] text-[var(--color-ink)]">
            {t.home.grandPrix.title}
          </h2>

          <p className="mt-[var(--space-md)] text-sm leading-[1.7] text-[var(--color-ink-soft)]">
            {t.home.grandPrix.text1}
          </p>

          <p className="mt-[var(--space-sm)] text-sm leading-[1.7] text-[var(--color-ink-soft)]">
            {t.home.grandPrix.text2}
          </p>

          <Link
            href="/grand-prix"
            className="ibpa-button ibpa-button-ghost mt-[var(--space-lg)]"
          >
            {t.home.grandPrix.cta}
          </Link>
        </div>

        <EditorialImageCard
          src="/images/events/DSC01430.jpg"
          alt="Winners celebration at the IBPA nominations event"
          eyebrow="Nominations showcase"
          title="Celebrating winners with editorial polish"
          text="A strong trophy and winner image helps the Grand Prix story feel celebratory and real."
          aspectClassName="aspect-[4/5] lg:aspect-[5/6]"
          objectPosition="center 30%"
          sizes="(max-width: 1024px) 100vw, 44vw"
          className="shadow-[0_24px_72px_rgba(12,16,20,0.12)]"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                Winners
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                A celebratory frame for success stories and achievement highlights.
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                Grand Prix
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Premium photography makes the award narrative feel more cinematic.
              </p>
            </div>
          </div>
        </EditorialImageCard>
      </div>
    </section>
  );
}

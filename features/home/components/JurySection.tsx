"use client";

import Link from "next/link";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JurySection() {
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--color-blue-wash)]">
      <div className="mx-auto grid max-w-(--content-width) gap-(--space-xl) px-(--page-gutter) page-section-pad lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="page-eyebrow">{t.home.juryCta.label}</p>

          <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] text-(--color-ink)">
            {t.home.juryCta.title}
          </h2>

          <p className="mt-(--space-md) text-sm leading-[1.7] text-(--color-ink-soft)">
            {t.home.juryCta.text1}
          </p>

          <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-ink-soft)">
            {t.home.juryCta.text2}
          </p>

          <p className="mt-(--space-sm) text-sm leading-[1.7] text-(--color-ink-soft)">
            {t.home.juryCta.text3}
          </p>

          <Link
            href="/jury"
            className="ibpa-button ibpa-button-gold mt-(--space-lg)"
          >
            {t.home.juryCta.button}
          </Link>
        </div>

        <div className="relative">
          <EditorialImageCard
            src="/images/team/sitting_group.jpg"
            alt="IBPA leadership and jury team seated together"
            eyebrow="About IBPA"
            title="Leadership, jury, and community"
            text="A trustworthy team image gives the platform a stronger real-world identity."
            aspectClassName="aspect-[4/5]"
            objectPosition="center top"
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="shadow-[0_24px_72px_rgba(12,16,20,0.12)]"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  Professional team
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Editorial, premium, and visibly connected to the event.
                </p>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  Jury quality
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Judges and leadership are presented with a calm luxury tone.
                </p>
              </div>
            </div>
          </EditorialImageCard>

          <EditorialImageCard
            src="/images/editorial/accending.jpg"
            alt="Professional beauty excellence portrait for the jury story"
            eyebrow="Professional excellence"
            title="The standard behind the judging"
            text="An overlapping detail card creates the magazine-style composition requested for the site."
            aspectClassName="aspect-[3/4]"
            objectPosition="center 20%"
            sizes="(max-width: 1024px) 60vw, 20vw"
            className="absolute -bottom-10 left-6 hidden w-40 border-[6px] border-[var(--color-white)] shadow-[0_18px_44px_rgba(12,16,20,0.16)] lg:block"
          />
        </div>
      </div>
    </section>
  );
}

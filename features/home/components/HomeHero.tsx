"use client";

import Link from "next/link";
import Countdown from "@/features/home/components/Countdown";
import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[linear-gradient(160deg,var(--color-white)_0%,var(--color-blue-wash)_54%,var(--color-blue-soft)_100%)] pt-[clamp(60px,8vh,72px)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_40%,rgba(114,160,193,0.2)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(185,217,235,0.32)_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto grid max-w-(--content-width) gap-(--space-xl) px-(--page-gutter) page-section-pad lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="page-eyebrow mb-(--space-md) animate-[fadeUp_0.7s_ease_both]">
            {t.home.hero.eyebrow}
          </p>

          <p className="script-accent animate-[fadeUp_0.7s_ease_0.05s_both] text-[clamp(1.7rem,3vw,2.7rem)] text-(--color-title-accent)">
            Beauty reimagined
          </p>

          <h1 className="animate-[fadeUp_0.7s_ease_0.1s_both] font-(--font-display) text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.1] text-(--color-ink)">
            {t.home.hero.title}
          </h1>

          <p className="mt-(--space-md) max-w-2xl animate-[fadeUp_0.7s_ease_0.22s_both] text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.75] text-(--color-ink-soft)">
            {t.home.hero.description}
          </p>

          <div className="mt-(--space-lg) flex animate-[fadeUp_0.7s_ease_0.34s_both] flex-wrap gap-(--space-sm)">
            <Link
              href="/apply"
              className="ibpa-button ibpa-button-gold"
            >
              {t.common.applyNow}
            </Link>

            <Link
              href="/categories"
              className="ibpa-button ibpa-button-ghost"
            >
              {t.home.hero.categoriesCta}
            </Link>
          </div>

          <div className="animate-[fadeUp_0.7s_ease_0.46s_both]">
            <Countdown />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[36rem] lg:justify-self-end">
          <EditorialImageCard
            src="/images/editorial/makeup.jpg"
            alt="Luxury editorial beauty portrait from an IBPA event"
            eyebrow="Editorial campaign"
            title="Beauty imagery with a real event pulse"
            text="The new site language pairs competition storytelling with premium photography and a softer luxury finish."
            aspectClassName="aspect-[4/5] lg:aspect-[5/6]"
            objectPosition="center 18%"
            sizes="(max-width: 1024px) 100vw, 42vw"
            preload
            className="shadow-[0_24px_70px_rgba(12,16,20,0.14)]"
          >
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  About IBPA
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Premium, editorial storytelling for beauty professionals.
                </p>
              </div>
              <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  Live coverage
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Real photography across awards, jury, and community moments.
                </p>
              </div>
            </div>
          </EditorialImageCard>

          <div className="absolute -left-6 bottom-8 hidden w-48 overflow-hidden rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-white)] p-2 shadow-[var(--shadow-lg)] lg:block">
            <div className="overflow-hidden rounded-[calc(var(--radius)-4px)]">
              <EditorialImageCard
                src="/images/team/sitting_group.jpg"
                alt="IBPA team and leadership group photo"
                eyebrow="About IBPA"
                title="Trusted leadership"
                text="A professional team shape for the platform's jury and membership story."
                aspectClassName="aspect-[3/4]"
                objectPosition="center top"
                sizes="18vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

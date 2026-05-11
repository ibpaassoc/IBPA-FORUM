"use client";

import Link from "next/link";
import Countdown from "@/features/home/components/Countdown";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[linear-gradient(160deg,var(--color-white)_0%,var(--color-blue-wash)_54%,var(--color-blue-soft)_100%)] pt-[clamp(60px,8vh,72px)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_40%,rgba(114,160,193,0.2)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(185,217,235,0.32)_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto flex max-w-(--content-width) flex-col gap-(--space-xl) px-(--page-gutter) page-section-pad lg:flex-row lg:items-center lg:justify-between">
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
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HeroPrimaryButton, HeroSecondaryButton } from "@/shared/components/public";

export default function AssociationHero() {
  const { t } = useLanguage();
  const h = t.associationPage.hero;

  return (
    <section className="landing-hero-section relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/team/sitting_group.jpg"
          alt={h.title}
          fill
          style={{ objectPosition: "50% 24%" }}
          className="object-cover opacity-70"
          priority
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.20)_42%,rgba(0,0,0,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(185,217,235,0.16),transparent_34%)]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-24 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <p className="font-[var(--font-accent-family)] text-[clamp(0.85rem,1.1vw,1rem)] italic tracking-[0.08em] text-white/72">
          {h.eyebrow}
        </p>

        <h1 className="mt-5 max-w-[13ch] font-[var(--font-title-family)] text-[clamp(3rem,8.6vw,7.4rem)] font-light leading-[0.86] tracking-[-0.05em] text-white [text-shadow:0_10px_38px_rgba(0,0,0,0.52)]">
          {h.title}
        </h1>

        <div className="mt-8 flex max-w-4xl flex-col items-center gap-5">
          <p className="max-w-[28ch] font-[var(--font-accent-family)] text-[clamp(1.55rem,3vw,2.8rem)] italic leading-[1.08] tracking-[-0.02em] text-white/86 [text-shadow:0_8px_28px_rgba(0,0,0,0.35)]">
            {h.subtitle}
          </p>

          <p className="max-w-3xl text-base leading-7 text-white/70 md:text-lg md:leading-8">
            {h.description}
          </p>
        </div>
      </div>
    </section>
  );
}

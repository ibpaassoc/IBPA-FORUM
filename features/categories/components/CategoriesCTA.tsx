"use client";

import Image from "next/image";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingPrimaryButton } from "@/shared/components/public";

export default function CategoriesCTA() {
  const { t } = useLanguage();
  const c = t.categoriesPage.copy;

  return (
    <section className="landing-photo-section relative min-h-[720px] overflow-hidden bg-white md:min-h-[86vh]">
      <div className="absolute inset-0">
        <Image
          src="/images/gallery/podium.png"
          alt="IBPA Beauty Award categories"
          fill
          className="object-cover object-[50%_42%]"
          sizes="100vw"
          priority={false}
        />

        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_36%,rgba(0,0,0,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[720px] items-center justify-center px-[var(--page-gutter)] py-20 md:min-h-[86vh]">
        <div className="w-full max-w-6xl">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.62),rgba(255,255,255,0.24))] px-5 py-10 text-center shadow-[0_34px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-8 sm:py-12 md:rounded-[3rem] lg:px-12 lg:py-14">
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-white/12 blur-2xl" />

            <h2 className="relative mx-auto max-w-[980px] text-balance font-[var(--font-title-family)] text-[clamp(2.45rem,6.3vw,5.75rem)] font-light uppercase leading-[0.86] tracking-[-0.055em] text-[#070914] [text-shadow:0_1px_0_rgba(255,255,255,0.68),0_14px_34px_rgba(255,255,255,0.18)]">
              {c.ctaTitle}
            </h2>

            <p className="relative mx-auto mt-6 max-w-[38rem] text-balance text-[0.95rem] leading-[1.8] text-[#172430]/72 sm:text-[1.02rem]">
              {c.ctaText}
            </p>

            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LandingPrimaryButton href="/account/login" >
                {c.ctaButton}
              </LandingPrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

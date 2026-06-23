"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LandingPrimaryButton,
  LandingSecondaryButton,
} from "@/shared/components/public";

export default function CategoriesCTA() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[680px] overflow-hidden bg-white md:min-h-[82vh]">
      <div className="absolute inset-0">
        <Image
          src="/images/gallery/0K9A4883.jpg"
          alt="IBPA Beauty Award categories"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
        />

        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.05)_43%,rgba(0,0,0,0.24)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[680px] items-center justify-center px-[var(--page-gutter)] py-[clamp(5rem,8vw,8rem)] md:min-h-[82vh]">
        <div className="max-w-4xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/62 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#172430] shadow-[0_14px_36px_rgba(20,49,71,0.16)] backdrop-blur-[18px]">
            <Sparkles size={13} />
            {t.categoriesPage.copy.ctaEyebrow}
          </div>

          <div className="rounded-[2.5rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.40),rgba(255,255,255,0.20))] px-6 py-9 shadow-[0_44px_130px_rgba(0,0,0,0.22)] backdrop-blur-[28px] sm:px-12 sm:py-11">
            <h2 className="font-[var(--font-title-family)] text-[clamp(2.8rem,7vw,6rem)] font-light uppercase leading-[0.9] tracking-[-0.045em] text-[#060712] [text-shadow:0_1px_0_rgba(255,255,255,0.62),0_8px_22px_rgba(255,255,255,0.22)]">
              {t.categoriesPage.copy.ctaTitle}
            </h2>

            <p className="mx-auto mt-5 max-w-[34rem] text-[clamp(0.92rem,1.15vw,1.05rem)] leading-[1.75] text-[#172430]/70">
              {t.categoriesPage.copy.ctaText}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <LandingPrimaryButton href="/apply">
                {t.common.applyAsParticipant}
              </LandingPrimaryButton>

              <LandingSecondaryButton href="/grand-prix">
                {t.common.grandPrix}
              </LandingSecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

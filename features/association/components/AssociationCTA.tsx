"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LandingPrimaryButton,
  LandingSecondaryButton,
} from "@/shared/components/public";

export default function AssociationCTA() {
  const { t } = useLanguage();
  const c = t.associationPage.cta;

  return (
    <section className="landing-photo-section relative min-h-[680px] overflow-hidden bg-white md:min-h-[82vh]">
      <div className="absolute inset-0">
        <Image
          src="/images/funny.jpg"
          alt={c.title}
          fill
          className="object-cover object-[50%_42%]"
          priority={false}
        />

        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.08)_44%,rgba(0,0,0,0.30)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[680px] items-center justify-center px-[var(--page-gutter)] py-[clamp(5rem,8vw,8rem)] md:min-h-[82vh]">
        <div className="max-w-4xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/62 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#172430] shadow-[0_12px_30px_rgba(20,49,71,0.14)] backdrop-blur-xl">
            <Sparkles size={13} />
            {c.eyebrow}
          </div>

          <div className="rounded-[2.5rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.22))] px-6 py-9 shadow-[0_34px_100px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-12 sm:py-11">
            <h2 className="font-[var(--font-title-family)] text-[clamp(2.8rem,7vw,6rem)] font-light leading-[0.9] tracking-[-0.055em] text-[#060712] [text-shadow:0_1px_0_rgba(255,255,255,0.62),0_8px_22px_rgba(255,255,255,0.22)]">
              {c.title}
            </h2>

            <p className="mx-auto mt-5 max-w-[34rem] text-[clamp(0.92rem,1.15vw,1.05rem)] leading-[1.75] text-[#172430]/70">
              {c.description}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <LandingPrimaryButton href="/apply">
                {c.applyButton}
              </LandingPrimaryButton>

              <LandingSecondaryButton
                href="https://ibpassociations.org"
              >
                {c.websiteButton}
              </LandingSecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

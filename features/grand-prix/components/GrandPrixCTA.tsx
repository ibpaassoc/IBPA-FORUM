"use client";

import Image from "next/image";
import { ArrowRight, Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingPrimaryButton, Reveal } from "@/shared/components/public";

export default function GrandPrixCTA() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.participationCta;

  return (
    <section className="landing-photo-section relative min-h-[clamp(620px,78vh,860px)] overflow-hidden bg-white">
      <Image
        src="/images/events/badges.jpg"
        alt="Grand Prix event moment"
        fill
        className="object-cover"
        style={{ objectPosition: "50% 42%" }}
        sizes="100vw"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_34%,rgba(255,255,255,0.34)_62%,rgba(255,255,255,0.08)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_24%_52%,rgba(185,217,235,0.34),rgba(255,255,255,0.08)_36%,rgba(255,255,255,0)_68%)]"
      />

      <div className="page-section relative z-10 flex min-h-[clamp(620px,78vh,860px)] items-center py-[clamp(4rem,8vw,7rem)]">
        <Reveal>
          <div className="max-w-[620px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#72a0c1]/25 bg-white/58 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#1e2430]/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
              <Trophy size={13} strokeWidth={1.7} />
              {c.eyebrow}
            </div>

            <h2 className="mt-6 max-w-[11ch] font-[var(--font-title-family)] text-[clamp(3rem,7vw,5.8rem)] font-light leading-[0.9] tracking-[-0.045em] text-[#1e2430]">
              {c.title}
            </h2>

            <p className="mt-6 max-w-xl text-[clamp(1.02rem,1.3vw,1.16rem)] leading-[1.8] text-[#5d6877]">
              {c.description}
            </p>

            <div className="mt-8">
              <LandingPrimaryButton href="/account/login">
                {t.common.applyNow}
              </LandingPrimaryButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LandingPrimaryButton,
  LandingSecondaryButton,
  Reveal,
} from "@/shared/components/public";
import { PRICING } from "@/data/pricing";

export default function GrandPrixCTA() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.participationCta;
  const ps = t.home.pricingSection;

  const pricingItems = [
    {
      label: c.members,
      price: PRICING.awardParticipation.ibpaMembers.oneNomination,
      detail: c.perNomSubmission,
    },
    {
      label: ps.nonMembers,
      price: PRICING.awardParticipation.nonMembers.oneNomination,
      detail: c.perNomSubmission,
    },
    {
      label: t.common.grandPrix,
      price: "5+",
      detail: c.nominationsActivate,
    },
  ];

  return (
    <section className="relative min-h-[clamp(680px,82vh,920px)] overflow-hidden bg-white">
      <Image
        src="/images/events/badges.jpg"
        alt="Grand Prix event moment"
        fill
        className="object-cover object-center"
        sizes="100vw"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,18,0.54)_0%,rgba(8,11,18,0.2)_36%,rgba(255,255,255,0.06)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.56),rgba(255,255,255,0.13)_34%,rgba(255,255,255,0)_64%)]"
      />

      <div className="page-section relative z-10 flex min-h-[clamp(680px,82vh,920px)] items-center justify-center py-[var(--space-2xl)]">
        <Reveal>
          <div className="relative mx-auto mr-[5] flex w-full max-w-5xl justify-center">
            <div className="w-full max-w-[760px] rounded-[2rem] border border-white/45 bg-white/42 px-6 py-7 text-center shadow-[0_28px_100px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:px-10 sm:py-10 lg:px-14 lg:py-12">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <Trophy size={13} strokeWidth={1.7} />
                {c.eyebrow}
              </div>

              <h2 className="mx-auto mt-5 max-w-[10ch] font-[var(--font-title-family)] text-[clamp(2.7rem,6vw,5.2rem)] font-light leading-[0.88] tracking-[-0.045em] text-[var(--color-ink)]">
                {c.title}
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-[1.75] text-[var(--color-ink)]/75">
                {c.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <LandingPrimaryButton href="/apply">
                  {t.common.applyNow}
                </LandingPrimaryButton>

                <LandingSecondaryButton href="/grand-prix">
                  <Trophy size={14} strokeWidth={1.7} />
                  {t.home.grandPrixSpotlight.learnMore}
                </LandingSecondaryButton>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:absolute lg:left-full lg:top-1/2 lg:ml-5 lg:mt-0 lg:w-[220px] lg:-translate-y-1/2 lg:grid-cols-1">
              {pricingItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.55rem] border border-white/55 bg-white/48 px-5 py-5 text-left shadow-[0_18px_55px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl"
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/55">
                    {item.label}
                  </p>
                  <p className="mt-2 font-[var(--font-title-family)] text-[2.15rem] font-light leading-none text-[var(--color-ink)]">
                    {item.price}
                  </p>
                  <p className="mt-2 text-[0.76rem] leading-snug text-[var(--color-ink)]/60">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

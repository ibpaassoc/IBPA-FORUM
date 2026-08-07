"use client";

import {
  Award,
  BadgeCheck,
  Globe2,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

const BENEFIT_ICONS = [
  Globe2,
  Users,
  ShieldCheck,
  Award,
  Megaphone,
  BadgeCheck,
];

export default function CategoriesWhyJoin() {
  const { t } = useLanguage();
  const c = t.categoriesPage.whyJoin;

  return (
    <section className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-12 h-[340px] w-[340px] rounded-full bg-[#b9d9eb]/14 blur-2xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-4xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-[var(--font-display)] text-[clamp(2.6rem,5.4vw,5.2rem)] leading-[0.94] tracking-[-0.055em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {c.benefits.map((benefit, index) => {
              const Icon = BENEFIT_ICONS[index];

              return (
                <GlassCard
                  key={benefit}
                  className="group relative min-h-[150px] overflow-hidden rounded-[32px] border border-white/65 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#72a0c1]/25"
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/40 to-transparent opacity-70" />

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-[0_10px_24px_rgba(114,160,193,0.13)] ring-1 ring-[#72a0c1]/12">
                    <Icon
                      className="h-5 w-5 text-[#72a0c1]"
                      strokeWidth={1.65}
                    />
                  </div>

                  <p className="mt-6 text-[1.08rem] font-medium leading-snug tracking-[-0.025em] text-[#1e2430]">
                    {benefit}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <GlassCard className="mt-6 overflow-hidden rounded-[32px] border border-[#b9d9eb]/45 p-6 shadow-[0_20px_52px_rgba(114,160,193,0.10)] md:p-7">
           <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
              {/* Left */}
              <div className="flex flex-col justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/10">
                  <Trophy className="h-5 w-5" />
                </div>

                <p className="page-eyebrow mt-5 text-[#72a0c1]">
                  {c.grandPrixEyebrow}
                </p>

                <h3 className="mt-4 max-w-[480px] font-[var(--font-display)] text-[clamp(2.3rem,4vw,3.8rem)] leading-[0.92] tracking-[-0.05em] text-[#1e2430]">
                  {c.grandPrixTitle}
                </h3>
              </div>

              {/* Right */}
              <div className="flex flex-col rounded-[30px] border border-[#b9d9eb]/30 bg-[#f8fbfd]/70 p-8">
                <p className="mt-5 text-[1.02rem] leading-8 text-[#5d6877]">
                  {c.grandPrixDescription}
                </p>

                <div className="mt-auto pt-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#72a0c1]/18 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#72a0c1] shadow-[0_8px_24px_rgba(114,160,193,0.08)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {c.grandPrixBadge}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

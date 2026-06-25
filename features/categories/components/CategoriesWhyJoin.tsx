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
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14%] top-12 h-[420px] w-[420px] rounded-full bg-[#b9d9eb]/22 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#72a0c1]/14 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-4xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.6rem,5.4vw,5.2rem)] leading-[0.94] tracking-[-0.055em] text-[#1e2430]">
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
                  className="group relative min-h-[150px] overflow-hidden rounded-[32px] border border-white/65 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#72a0c1]/25"
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
          <GlassCard className="mt-6 overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 px-7 py-7 shadow-[0_24px_60px_rgba(114,160,193,0.12)] md:px-8">
            <div className="grid min-h-[170px] gap-8 lg:grid-cols-[300px_1fr]">
              <div className="flex flex-col justify-center">
                <div className="flex h-13 w-13 items-center justify-center rounded-[18px] bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/10">
                  <Trophy className="h-6 w-6" strokeWidth={1.7} />
                </div>

                <p className="page-eyebrow mt-5 text-[#72a0c1]">
                  {c.grandPrixEyebrow}
                </p>

                <h3 className="mt-3 font-(--font-display) text-[clamp(2rem,3.2vw,3rem)] leading-[0.98] tracking-[-0.05em] text-[#1e2430]">
                  {c.grandPrixTitle}
                </h3>
              </div>

              <div className="flex flex-col justify-end pb-1 lg:items-end">
                <p className="max-w-[620px] text-[1.02rem] leading-8 text-[#5d6877] lg:text-right">
                  {c.grandPrixDescription}
                </p>

                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#72a0c1]/18 bg-white/80 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#72a0c1] shadow-[0_10px_28px_rgba(114,160,193,0.10)]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {c.grandPrixBadge}
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

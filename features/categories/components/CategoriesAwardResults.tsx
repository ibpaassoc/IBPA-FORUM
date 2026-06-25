"use client";

import { Calendar, CreditCard, Megaphone, ShieldAlert, Trophy } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

const PRICING_ICONS = [Calendar, CreditCard, Trophy];

export default function CategoriesAwardResults() {
  const { t } = useLanguage();
  const c = t.categoriesPage.awardResults;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#f2f8fb,#ffffff)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-16%] top-10 h-[440px] w-[440px] rounded-full bg-[#b9d9eb]/30 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[-12%] h-[520px] w-[520px] rounded-full bg-[#72a0c1]/12 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.6rem,5.6vw,5.4rem)] leading-[0.93] tracking-[-0.055em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <GlassCard className="mt-12 overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 px-6 py-7 shadow-[0_24px_60px_rgba(114,160,193,0.12)] sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
                <Megaphone className="h-6 w-6" strokeWidth={1.7} />
              </div>

              <div>
                <p className="font-(--font-display) text-[clamp(1.35rem,2.4vw,1.95rem)] leading-[1.18] tracking-[-0.03em] text-[#1e2430]">
                  {c.announcement}
                </p>

                <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-[#5d6877]">
                  {c.juryNote}
                </p>
              </div>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="page-eyebrow mt-16 text-[#72a0c1]">{c.pricing.eyebrow}</p>

          <h3 className="mt-3 font-(--font-display) text-[clamp(1.9rem,3.6vw,3rem)] leading-[0.98] tracking-[-0.045em] text-[#1e2430]">
            {c.pricing.title}
          </h3>

          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {c.pricing.items.map((item, index) => {
              const Icon = PRICING_ICONS[index] ?? CreditCard;

              return (
                <GlassCard
                  key={item.label}
                  className="group relative overflow-hidden rounded-[30px] border border-white/65 px-6 py-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#72a0c1]/25"
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/40 to-transparent opacity-70" />

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-[0_10px_24px_rgba(114,160,193,0.13)] ring-1 ring-[#72a0c1]/12">
                      <Icon className="h-5 w-5 text-[#72a0c1]" strokeWidth={1.65} />
                    </div>

                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#72a0c1]">
                      {item.label}
                    </p>
                  </div>

                  <p className="mt-6 font-(--font-display) text-[clamp(2.1rem,3.4vw,2.75rem)] leading-none tracking-[-0.04em] text-[#1e2430]">
                    {item.value}
                  </p>

                  <p className="mt-2 text-[0.95rem] leading-6 text-[#5d6877]">
                    {item.note}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-5 flex items-center gap-4 rounded-[26px] border border-[#72a0c1]/22 bg-white/70 px-6 py-5 backdrop-blur-xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
              <ShieldAlert className="h-5 w-5" strokeWidth={1.7} />
            </div>

            <p className="text-[0.98rem] font-medium leading-7 text-[#1e2430]">
              {c.pricing.nonRefundable}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";
import { LandingPrimaryButton } from "@/shared/components/public";

export default function CategoriesAwardResults() {
  const { t } = useLanguage();
  const c = t.categoriesPage.awardResults;

  const timeline = [
    c.timeline.applicationsOpen,
    c.timeline.registrationCloses,
    c.timeline.awardCeremony,
  ];

  const pricingRows = [
    c.pricing.oneNomination,
    c.pricing.threeNominations,
    c.pricing.fiveNominations,
  ];

  return (
    <section className="landing-section-strong relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-18%] top-[-16%] h-[520px] w-[520px] rounded-full bg-[#b9d9eb]/18 blur-2xl" />
      </div>

      <div className="page-section relative z-10">
        <Reveal>
          <div className="max-w-5xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>
            <h2 className="mt-5 font-[var(--font-display)] text-[clamp(2.75rem,6vw,5.8rem)] leading-[0.9] tracking-[-0.06em] text-[#1e2430]">
              {c.title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <GlassCard className="mt-12 overflow-hidden rounded-[42px] border border-[#b9d9eb]/45 bg-white/68 p-6 shadow-[0_24px_72px_rgba(114,160,193,0.13),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="relative">
              <div className="absolute left-[10%] right-[10%] top-[38px] hidden h-[2px] rounded-full bg-gradient-to-r from-[#72a0c1]/20 via-[#72a0c1]/70 to-[#72a0c1]/20 md:block" />

              <div className="grid gap-4 md:grid-cols-3">
                {timeline.map((item, index) => {
                  const featured = index === timeline.length - 1;

                  return (
                    <div
                      key={item.label}
                      className={[
                        "relative rounded-[32px] border p-5 backdrop-blur-xl transition duration-200",
                        featured
                          ? "border-[#72a0c1]/45 bg-[#eef7fb]/90 shadow-[0_24px_70px_rgba(114,160,193,0.22)]"
                          : "border-[#b9d9eb]/38 bg-white/72 shadow-[0_18px_50px_rgba(114,160,193,0.12)]",
                      ].join(" ")}
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <div
                          className={[
                            "relative z-10 flex h-12 w-12 items-center justify-center rounded-full ring-8 ring-white/80",
                            featured
                              ? "bg-[#72a0c1] text-white"
                              : "bg-[#72a0c1]/10 text-[#72a0c1]",
                          ].join(" ")}
                        >
                          {featured ? (
                            <Trophy className="h-5 w-5" strokeWidth={1.65} />
                          ) : (
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="h-px flex-1 bg-gradient-to-r from-[#72a0c1]/35 to-transparent md:hidden" />
                      </div>

                      <p className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[#72a0c1]">
                        {item.label}
                      </p>

                      <p className="mt-5 font-[var(--font-display)] text-[2.35rem] leading-none tracking-[-0.055em] text-[#1e2430]">
                        {item.date}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal delay={0.14}>
            <GlassCard className="relative h-full overflow-hidden rounded-[42px] border border-white/70 bg-white/58 p-7 shadow-[0_22px_66px_rgba(114,160,193,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
                <UsersRound className="h-6 w-6" strokeWidth={1.65} />
              </div>

              <p className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
                {c.jury.title}
              </p>

              <p className="mt-4 max-w-md text-[1rem] leading-7 text-[#5d6877]">
                {c.jury.note}
              </p>

              <div className="mt-8 grid gap-3">
                {c.jury.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-full border border-[#b9d9eb]/35 bg-white/58 px-4 py-3"
                  >
                    <CheckCircle2
                      className="h-4.5 w-4.5 shrink-0 text-[#72a0c1]"
                      strokeWidth={1.8}
                    />
                    <span className="text-[0.88rem] font-medium text-[#1e2430]">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          <Reveal delay={0.2}>
            <GlassCard className="relative h-full overflow-hidden rounded-[42px] border border-[#b9d9eb]/45 bg-white/66 p-5 shadow-[0_24px_72px_rgba(114,160,193,0.13),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:p-7 lg:p-8">
              <p className="page-eyebrow text-[#72a0c1]">
                {c.pricing.eyebrow}
              </p>

              <div className="mt-8 overflow-hidden rounded-[32px] border border-[#b9d9eb]/40 bg-white/62">
                <div className="grid grid-cols-[1.25fr_0.85fr_0.95fr] border-b border-[#b9d9eb]/35 bg-[#eef7fb]/70 px-4 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#72a0c1] sm:px-6">
                  <span>{c.pricing.headers.nominations}</span>
                  <span className="text-right">
                    {c.pricing.headers.members}
                  </span>
                  <span className="text-right">
                    {c.pricing.headers.nonMembers}
                  </span>
                </div>

                {pricingRows.map((row, index) => (
                  <div
                    key={row.label}
                    className={[
                      "grid grid-cols-[1.25fr_0.85fr_0.95fr] items-center gap-3 border-b border-[#b9d9eb]/25 px-4 py-5 last:border-b-0 sm:px-6",
                      index === 2 ? "bg-[#eef7fb]/56" : "bg-white/32",
                    ].join(" ")}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#1e2430]">
                          {row.label}
                        </p>

                        {index === 2 && (
                          <span className="rounded-full bg-white/82 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[#72a0c1] ring-1 ring-[#72a0c1]/14">
                            {c.pricing.grandPrixEligibility}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="font-[var(--font-display)] text-right text-[1.65rem] leading-none tracking-[-0.04em] text-[#1e2430]">
                      {row.member}
                    </p>

                    <p className="font-[var(--font-display)] text-right text-[1.65rem] leading-none tracking-[-0.04em] text-[#1e2430]">
                      {row.nonMember}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex items-start gap-3 rounded-[26px] border border-[#72a0c1]/16 bg-white/62 px-5 py-4">
                  <Info
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#72a0c1]"
                    strokeWidth={1.7}
                  />

                  <p className="text-[0.88rem] leading-6 text-[#6b7582]">
                    {c.pricing.nonRefundable}
                  </p>
                </div>

                <LandingPrimaryButton href="/apply">
                  {t.common.applyNow}
                </LandingPrimaryButton>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

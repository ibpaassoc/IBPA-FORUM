"use client";

import {
  CheckCircle2,
  Trophy,
  UsersRound,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function CategoriesAwardResults() {
  const { t } = useLanguage();
  const c = t.categoriesPage.awardResults;

  const timeline = [
    c.timeline.applicationsOpen,
    c.timeline.registrationCloses,
    c.timeline.awardCeremony,
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

        <div className="mt-6">
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

        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex min-h-[56px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,252,255,0.72))] px-8 py-4 font-[var(--font-ui-family)] text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#24394b] backdrop-blur-[30px] shadow-[0_1px_0_rgba(255,255,255,0.95),0_10px_30px_rgba(122,152,175,0.10),0_24px_60px_rgba(122,152,175,0.16),inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:scale-[1.01] hover:border-[#8eb6d3]/70 hover:shadow-[0_2px_0_rgba(255,255,255,1),0_18px_50px_rgba(122,152,175,0.18),0_40px_90px_rgba(114,160,193,0.20)]"
    >
      <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
      <span className="absolute inset-x-8 top-[1px] h-[45%] rounded-full bg-gradient-to-b from-white/80 to-transparent" />
      <span className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/70 to-transparent opacity-60" />
      <span className="absolute inset-[1px] rounded-full border border-white/60" />
      <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-[40%] before:rotate-[18deg] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:transition-all before:duration-1000 group-hover:before:left-[140%]" />

      <span className="relative z-10">{children}</span>
      <ArrowRight
        size={16}
        className="relative z-10 text-[#72a0c1] transition-all duration-500 group-hover:translate-x-1.5 group-hover:scale-110"
      />
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex min-h-[56px] items-center justify-center overflow-hidden rounded-full border border-[#b9d9eb]/60 bg-white/35 px-8 py-4 font-[var(--font-ui-family)] text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-[#24394b] backdrop-blur-2xl shadow-[0_10px_30px_rgba(122,152,175,0.10)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#8eb6d3]/75 hover:bg-white/55 hover:shadow-[0_18px_46px_rgba(122,152,175,0.16)]"
    >
      <span className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

export default function HomeGrandPrix() {
  const { t } = useLanguage();
  const gp = t.home.grandPrixSpotlight;

  return (
    <section className="relative min-h-[clamp(640px,82vh,900px)] overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
        <Image
          src="/images/winners.png"
          alt="IBPA Grand Prix"
          fill
          priority={false}
          className="object-cover"
          style={{ objectPosition: "63% 20%" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_44%,rgba(255,255,255,0.14)_100%)]" />
        <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.96)_18%,rgba(255,255,255,0.72)_35%,rgba(255,255,255,0.26)_55%,rgba(255,255,255,0)_76%)]" />
        <div className="absolute inset-0 lg:hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.72)_42%,rgba(255,255,255,0.18)_100%)]" />
      </div>

      <div className="page-section relative z-10 flex min-h-[clamp(640px,82vh,900px)] items-center py-[clamp(4rem,8vw,7rem)]">
        <div className="max-w-[560px]">
          <Reveal>
            <p className="page-eyebrow mb-5">{gp.eyebrow}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="max-w-[9ch] font-[var(--font-title-family)] text-[clamp(3.2rem,8vw,6rem)] font-light leading-[0.9] tracking-[-0.035em] text-[var(--color-ink)]">
              {gp.title}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="my-7 flex items-center gap-4">
              <div className="h-px w-12 bg-[var(--color-blue)]/35" />
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    size={9}
                    className="fill-[var(--color-blue)]/30 text-[var(--color-blue)]/30"
                  />
                ))}
              </div>
              <div className="h-px w-12 bg-[var(--color-blue)]/35" />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="max-w-[34rem] font-[var(--font-body-family)] text-[clamp(1rem,1.25vw,1.16rem)] leading-[1.8] text-[var(--color-ink-soft)]">
              {gp.description}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 grid max-w-[460px] gap-3 sm:grid-cols-2">
              {gp.stats.map((stat) => (
                <GlassCard
                  key={stat.label}
                  tone="blue"
                  hoverLift
                  className="flex items-center gap-3 rounded-[1.15rem] bg-white/48 px-4 py-3 backdrop-blur-2xl"
                >
                  <span className="font-[var(--font-title-family)] text-[1.75rem] font-light leading-none text-[var(--color-ink)]">
                    {stat.value}
                  </span>
                  <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                    {stat.label}
                  </span>
                </GlassCard>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href="/apply">{gp.cta}</PrimaryButton>
              <SecondaryButton href="/grand-prix">{gp.learnMore}</SecondaryButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

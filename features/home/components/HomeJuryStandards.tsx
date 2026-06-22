"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function HomeJuryStandards() {
  const { t } = useLanguage();

  const benefits = [
    t.home.copy.juryBenefit1 ?? "Professional standards & certification",
    t.home.copy.juryBenefit2 ?? "International collaboration network",
    t.home.copy.juryBenefit3 ?? "Access to global beauty community",
    t.home.copy.juryBenefit4 ?? "Industry recognition & visibility",
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-off-white)]" style={{ minHeight: "clamp(480px, 65vh, 720px)" }}>
      {/* Right-side full-bleed background image */}
      <div className="absolute right-0 top-0 hidden h-full w-[46%] lg:block">
        <Image
          src="/images/team/sitting_group.jpg"
          alt="Professional jury leadership and community moment"
          fill
          sizes="46vw"
          className="object-cover object-center"
        />
        {/* Left fade so text is readable */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,248,246,1)_0%,rgba(248,248,246,0.30)_28%,rgba(248,248,246,0)_52%)]" />
      </div>

      {/* Content */}
      <div className="page-section relative z-10 flex h-full items-center py-[clamp(4rem,8vw,7rem)]">
        <div className="max-w-[52%] lg:max-w-[46%]">
          <Reveal>
            <p className="page-eyebrow mb-[var(--space-sm)]">{t.home.copy.juryStandards}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-[var(--font-title-family)] text-[clamp(2rem,3.5vw,3.2rem)] font-light leading-[1.06] text-[var(--color-ink)]">
              {t.home.copy.juryStandardsTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-[var(--space-md)] text-[0.97rem] leading-[1.78] text-[var(--color-ink-soft)]">
              {t.home.juryCta.text2}
            </p>
          </Reveal>

          {/* Benefit list */}
          <Reveal delay={0.20}>
            <ul className="mt-[var(--space-lg)] space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[0.93rem] leading-[1.65] text-[var(--color-ink-soft)]">
                  <CheckCircle
                    size={16}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-[var(--color-blue)]"
                  />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.28}>
            <Link
              href="/jury"
              className="mt-[var(--space-lg)] inline-flex items-center gap-2.5 rounded-full bg-black px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-xl transition-all duration-300 hover:scale-[1.04]"
            >
              {t.home.juryCta.button} <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* Mobile image */}
      <div className="relative mt-8 aspect-[16/9] w-full lg:hidden">
        <Image
          src="/images/team/sitting_group.jpg"
          alt="IBPA Jury Standards"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
    </section>
  );
}

"use client";

import { ArrowUpRight, Handshake } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, Reveal } from "@/shared/components/public";

export default function HomePartners() {
  const { t } = useLanguage();
  const c = t.home.partners;

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-14%] top-12 h-[440px] w-[440px] rounded-full bg-[#b9d9eb]/20 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

              <h2 className="mt-5 font-[var(--font-display)] text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-[#1e2430]">
                {c.title}
              </h2>

              <p className="mt-5 max-w-xl text-[1.02rem] leading-8 text-[#5d6877]">
                {c.description}
              </p>
            </div>

            <a
              href="mailto:forum-support@ibpassociations.org"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#72a0c1]/25 bg-white/80 px-5 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#24394b] shadow-[0_10px_28px_rgba(114,160,193,0.12)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[#72a0c1]/45"
            >
              {c.cta}
              <ArrowUpRight className="h-4 w-4 text-[#72a0c1]" strokeWidth={1.9} />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5">
            {c.items.map((partner, index) => (
              <a
                key={`${partner.name}-${index}`}
                href={partner.href}
                target={partner.href.startsWith("http") ? "_blank" : undefined}
                rel={partner.href.startsWith("http") ? "noreferrer" : undefined}
                className="group block"
              >
                <GlassCard className="flex h-full items-center gap-5 rounded-[28px] border border-white/65 px-6 py-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#72a0c1]/25">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-[#72a0c1] shadow-[0_10px_24px_rgba(114,160,193,0.13)] ring-1 ring-[#72a0c1]/12">
                    <Handshake className="h-6 w-6" strokeWidth={1.6} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-[var(--font-display)] text-[1.4rem] leading-tight tracking-[-0.025em] text-[#1e2430]">
                      {partner.name}
                    </p>
                    <p className="mt-1 text-[0.95rem] leading-6 text-[#5d6877]">
                      {partner.text}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-[#72a0c1] opacity-0 transition-all duration-500 group-hover:translate-x-0.5 group-hover:opacity-100"
                    strokeWidth={1.8}
                  />
                </GlassCard>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

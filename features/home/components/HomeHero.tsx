"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  const ticker = [
    "IBPA Beauty Award 2026",
    "International Recognition",
    "Professional Excellence",
    "11 Categories",
    "Global Jury",
    "Open to the World",
  ];
  const loopTicker = [...ticker, ...ticker, ...ticker];

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Full-screen background image — no blur */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/events/HomeHero.jpg"
          alt="IBPA Beauty Award 2026"
          fill
          style={{ objectPosition: "50% 20%" }}
          className="object-cover opacity-75"
          priority
        />
        {/* Dark gradient overlay — strong at bottom for ticker legibility */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0.60)_100%)]" />
      </div>

      {/* Centered editorial content */}
      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-28 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <p className="font-[var(--font-accent-family)] text-[clamp(0.95rem,1.4vw,1.2rem)] italic tracking-wide text-white/70">
          Industry Leadership Conference
        </p>

        <h1 className="mt-4 max-w-[14ch] font-[var(--font-title-family)] text-[clamp(3.2rem,11vw,8.5rem)] font-light leading-[0.90] tracking-[-0.03em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]">
          IBPA Beauty Award 2026
        </h1>

        <p className="mt-4 mb-0 max-w-xl font-[var(--font-accent-family)] text-[clamp(2.05rem,3.5vw,3.35rem)] italic leading-[1.65] text-white/80">
          Beauty Business Forum & Beauty Award
        </p>

        <p className="mt-1 mb-0 max-w-xl font-[var(--font-accent-family)] text-[clamp(1.05rem,2vw,1.35rem)] italic leading-[1.65] text-white/80">
          September 25-26, 2026
        </p>

        <p className="mt-0 max-w-xl font-[var(--font-accent-family)] text-[clamp(1.05rem,2vw,1.35rem)] italic leading-[1.65] text-white/80">
          Los-Angeles, California
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apply"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-[#050505] via-[#111111] to-[#050505] px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#7a98af]/60 hover:shadow-[0_20px_60px_rgba(122,152,175,0.2)]"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#7a98af]/10 opacity-60 transition-opacity duration-700 group-hover:opacity-100" />

            <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-700 group-hover:inset-x-4 group-hover:via-[#b9d9eb]/70" />

            <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-[#b9d9eb]/25 before:to-transparent before:transition-all before:duration-700 group-hover:before:left-[130%]" />

            <span className="relative z-10">
              {t.common.applyAsParticipant}
            </span>

            <ArrowRight
              size={16}
              className="relative z-10 text-[#b9d9eb] transition-all duration-500 group-hover:translate-x-1 group-hover:text-white"
            />
          </Link>

          <Link
            href="/jury"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/45 bg-white/[0.09] px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#b9d9eb]/65 hover:bg-white/[0.14] hover:shadow-[0_18px_50px_rgba(122,152,175,0.18)]"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/14 via-white/[0.03] to-[#7a98af]/15 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />

            <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-700 group-hover:inset-x-4 group-hover:via-[#b9d9eb]/80" />

            <span className="absolute inset-[1px] rounded-full border border-[#b9d9eb]/0 transition-colors duration-700 group-hover:border-[#b9d9eb]/20" />

            <span className="absolute inset-0 before:absolute before:left-[-140%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-all before:duration-700 group-hover:before:left-[140%]" />

            <span className="relative z-10">
              {t.common.applyAsJury}
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 z-20 w-full overflow-hidden border-t border-white/12 py-4" style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(20px)" }}>
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{
            animation: "marquee-ticker 32s linear infinite",
            width: "max-content",
          }}
        >
          {loopTicker.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-10 font-[var(--font-accent-family)] text-[0.82rem] italic tracking-[0.08em] text-white/60"
            >
              <span>{item}</span>
              <span className="text-white/30">◆</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}

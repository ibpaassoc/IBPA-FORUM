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
          Beauty Business Forum
        </p>

        <h1 className="mt-4 max-w-[14ch] font-[var(--font-title-family)] text-[clamp(3.2rem,11vw,8.5rem)] font-light leading-[0.90] tracking-[-0.03em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]">
          {t.home.hero.title}
        </h1>

        <p className="mt-6 max-w-xl font-[var(--font-accent-family)] text-[clamp(1.05rem,2vw,1.35rem)] italic leading-[1.65] text-white/80">
          {t.home.hero.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2.5 rounded-full bg-black px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-2xl transition-all duration-300 hover:scale-[1.04] hover:bg-[var(--color-blue)]"
          >
            {t.common.applyAsParticipant} <ArrowRight size={16} />
          </Link>
          <Link
            href="/jury"
            className="inline-flex items-center rounded-full border border-white/50 bg-white/10 px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
          >
            {t.common.applyAsJury}
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

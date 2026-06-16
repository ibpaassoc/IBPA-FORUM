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
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#030213]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/events/HomeHero.jpg"
          alt="IBPA Beauty Award 2026"
          fill
          style={{ objectPosition: "50% 20%" }}
          className="object-cover opacity-55"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030213]/60 via-[#030213]/30 to-[#030213]/75" />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex w-full max-w-[var(--content-width)] flex-col items-center px-[var(--page-gutter)] text-center">
        <div className="flex w-full flex-col gap-8 py-24 sm:py-36 md:py-52">
          <p className="font-[var(--font-ui-family)] text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-white/55">
            Beauty Business Forum
          </p>

          <h1
            className="font-[var(--font-ui-family)] text-[clamp(3.2rem,12vw,9rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white"
            style={{ textShadow: "0 6px 32px rgba(0,0,0,0.45)" }}
          >
            {t.home.hero.title}
          </h1>

          <p className="mx-auto max-w-xl font-[var(--font-accent-family)] text-[clamp(1.1rem,3.5vw,1.6rem)] italic leading-[1.55] text-[var(--color-blue-soft)]">
            {t.home.hero.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/95"
            >
              {t.common.applyAsParticipant} <ArrowRight size={16} />
            </Link>
            <Link
              href="/jury"
              className="ibpa-button ibpa-button-white text-[0.78rem]"
            >
              {t.common.applyAsJury}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 z-20 w-full overflow-hidden border-t border-white/10 bg-[#030213]/60 py-4 backdrop-blur-sm">
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
              className="inline-flex items-center gap-10 font-[var(--font-ui-family)] text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-white/45"
            >
              <span>{item}</span>
              <span className="text-white/25">◆</span>
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

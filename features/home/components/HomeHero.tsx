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
    <section className="relative flex min-h-[92svh] items-center justify-center overflow-hidden bg-[var(--color-off-white)] pt-[var(--site-header-height)]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/events/HomeHero.jpg"
          alt="IBPA Beauty Award 2026"
          fill
          style={{ objectPosition: "50% 20%" }}
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.96)_0%,rgba(248,248,246,0.9)_38%,rgba(185,217,235,0.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--color-off-white)] to-transparent" />
      </div>

      {/* Editorial content */}
      <div className="relative z-10 grid w-full max-w-[var(--content-width)] items-end gap-[var(--space-xl)] px-[var(--page-gutter)] py-[clamp(4rem,10vw,8rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.48fr)]">
        <div className="flex w-full flex-col gap-7 text-left">
          <p className="font-[var(--font-accent-family)] text-[clamp(1rem,1.4vw,1.25rem)] italic tracking-wide text-[var(--color-hover-accent)]">
            Beauty Business Forum
          </p>

          <h1
            className="max-w-[10ch] font-[var(--font-title-family)] text-[clamp(3.4rem,11vw,8.4rem)] font-light leading-[0.9] tracking-[-0.025em] text-[var(--color-ink)]"
          >
            {t.home.hero.title}
          </h1>

          <p className="max-w-xl font-[var(--font-accent-family)] text-[clamp(1.12rem,3vw,1.58rem)] italic leading-[1.58] text-[var(--color-ink-soft)]">
            {t.home.hero.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/apply" className="ibpa-button ibpa-button-blue inline-flex items-center gap-2.5">
              {t.common.applyAsParticipant} <ArrowRight size={16} />
            </Link>
            <Link
              href="/jury"
              className="ibpa-button ibpa-button-soft"
            >
              {t.common.applyAsJury}
            </Link>
          </div>
        </div>

        <div className="premium-glass ml-auto hidden w-full max-w-sm p-[var(--space-lg)] lg:block">
          <p className="premium-label">IBPA 2026</p>
          <div className="mt-[var(--space-md)] grid gap-3">
            {ticker.slice(1, 5).map((item) => (
              <div key={item} className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] pb-3 last:border-0 last:pb-0">
                <span className="font-[var(--font-accent-family)] text-[1.05rem] italic text-[var(--color-ink)]">
                  {item}
                </span>
                <span className="h-px w-10 shrink-0 bg-[var(--color-blue-soft)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 z-20 w-full overflow-hidden border-y border-[var(--border-soft)] bg-white/72 py-4 backdrop-blur-xl">
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
              className="inline-flex items-center gap-10 font-[var(--font-accent-family)] text-[0.85rem] italic tracking-[0.08em] text-[var(--color-ink-muted)]"
            >
              <span>{item}</span>
              <span className="text-[var(--color-blue)]/60">◆</span>
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

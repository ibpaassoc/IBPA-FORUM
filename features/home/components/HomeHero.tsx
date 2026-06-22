"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard, OvalBlob } from "@/shared/components/public";

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
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-white">
      {/* ── Decorative organic blobs ── */}
      <OvalBlob
        size="lg"
        opacity={0.28}
        animate
        className="right-[-12%] top-[-8%] z-0"
      />
      <OvalBlob
        size="sm"
        opacity={0.22}
        animate
        className="bottom-[12%] left-[-4%] z-0"
        color="var(--color-blue-soft)"
      />

      {/* ── Background image — photo commands the space ── */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/events/HomeHero.jpg"
          alt="IBPA Beauty Award 2026"
          fill
          style={{ objectPosition: "50% 20%" }}
          className="object-cover opacity-[0.62]"
          priority
        />
        {/* Angled overlay — light on the left for text, nearly transparent on the right */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.70)_0%,rgba(255,255,255,0.28)_42%,rgba(185,217,235,0.08)_100%)]" />
        {/* Narrow bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ── Editorial content ── */}
      <div className="relative z-10 grid w-full max-w-[var(--content-width)] items-center gap-[var(--space-xl)] px-[var(--page-gutter)] pb-20 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.6fr)]">

        {/* Left — editorial text */}
        <div className="flex w-full flex-col gap-7 text-left">
          <p className="font-[var(--font-accent-family)] text-[clamp(1rem,1.4vw,1.25rem)] italic tracking-wide text-[var(--color-hover-accent)]">
            Beauty Business Forum
          </p>

          <h1 className="max-w-[10ch] font-[var(--font-title-family)] text-[clamp(3.6rem,12vw,9rem)] font-light leading-[0.88] tracking-[-0.03em] text-[var(--color-ink)]">
            {t.home.hero.title}
          </h1>

          <p className="max-w-xl font-[var(--font-accent-family)] text-[clamp(1.12rem,2.5vw,1.48rem)] italic leading-[1.6] text-[var(--color-ink-soft)]">
            {t.home.hero.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/apply" className="ibpa-button ibpa-button-blue inline-flex items-center gap-2.5">
              {t.common.applyAsParticipant} <ArrowRight size={16} />
            </Link>
            <Link href="/jury" className="ibpa-button ibpa-button-ghost">
              {t.common.applyAsJury}
            </Link>
          </div>
        </div>

        {/* Right — floating glass panels (desktop only) */}
        <div className="relative hidden min-h-[320px] lg:flex lg:flex-col lg:items-end lg:gap-4">
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[300px]"
          >
            <GlassCard tone="white" className="p-6">
              <p className="premium-label mb-2">IBPA Beauty Award</p>
              <p className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]">
                2026 Edition
              </p>
              <p className="mt-3 text-[0.8rem] leading-[1.6] text-[var(--color-ink-soft)]">
                11 categories · Grand Prix · Global jury
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[240px]"
          >
            <GlassCard tone="blue" className="flex items-center gap-3 px-5 py-4">
              <MapPin size={14} className="shrink-0 text-[var(--color-blue)]" strokeWidth={1.5} />
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">Location</p>
                <p className="font-[var(--font-accent-family)] text-[1.05rem] italic text-[var(--color-ink)]">
                  Monaco · Oct 2026
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom ticker ── */}
      <div className="absolute bottom-0 left-0 z-20 w-full overflow-hidden border-y border-[var(--border-glass)] py-4" style={{ background: "rgba(255,255,255,0.60)", backdropFilter: "blur(24px)" }}>
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

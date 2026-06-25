"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HeroPrimaryButton, HeroSecondaryButton } from "@/shared/components/public";

const TicketModal = dynamic(() => import("@/features/tickets/components/TicketModal"), {
  ssr: false,
  loading: () => null,
});

export default function HomeHero() {
  const { t } = useLanguage();
  const h = t.home.hero;
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const loopTicker = [...h.ticker, ...h.ticker, ...h.ticker];

  return (
    <>
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 z-[1]">
          <Image
            src="/images/events/HomeHero.jpg"
            alt="IBPA Beauty Award 2026"
            fill
            style={{ objectPosition: "50% 20%" }}
            className="object-cover opacity-75"
            priority
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.68)_100%)]" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-28 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
          <p className="font-[var(--font-accent-family)] text-[clamp(0.85rem,1.1vw,1rem)] italic tracking-[0.08em] text-white/72">
            {h.eyebrow}
          </p>

          <h1 className="mt-5 max-w-[12ch] font-[var(--font-title-family)] text-[clamp(3.1rem,9vw,7.6rem)] font-light leading-[0.86] tracking-[-0.045em] text-white [text-shadow:0_10px_38px_rgba(0,0,0,0.48)]">
            {h.title}
          </h1>

          <div className="mt-8 flex max-w-3xl flex-col items-center gap-5">
            <p className="max-w-[20ch] font-[var(--font-accent-family)] text-[clamp(1.75rem,3.4vw,3.15rem)] italic leading-[1.08] tracking-[-0.02em] text-white/86 [text-shadow:0_8px_28px_rgba(0,0,0,0.35)]">
              {h.subtitle}
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-white/18 bg-black/22 px-5 py-2.5 font-[var(--font-accent-family)] text-[clamp(0.95rem,1.35vw,1.12rem)] italic text-white/78 backdrop-blur-xl">
              <span>{h.date}</span>
              <span className="hidden text-white/35 sm:inline">◆</span>
              <span>{h.location}</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            {/* Primary CTA — opens the ticket modal */}
            <HeroPrimaryButton onClick={() => setIsTicketModalOpen(true)}>
              {h.buyTickets}
            </HeroPrimaryButton>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <HeroSecondaryButton href="/apply">
                {t.common.applyAsParticipant}
              </HeroSecondaryButton>

              <HeroSecondaryButton href="/jury">
                {t.common.applyAsJury}
              </HeroSecondaryButton>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 z-20 w-full overflow-hidden border-t border-white/12 py-4"
          style={{
            background: "rgba(0,0,0,0.40)",
            backdropFilter: "blur(20px)",
          }}
        >
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
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-33.333%);
            }
          }
        `}</style>
      </section>

      {isTicketModalOpen ? (
        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
        />
      ) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import TicketModal from "@/features/tickets/components/TicketModal";

export default function HomeHero() {
  const { t } = useLanguage();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const ticker = [
    "IBPA Beauty Award 2026",
    "International Recognition",
    "Professional Excellence",
    "11 Categories",
    "Global Jury",
    "Open to the World",
  ];

  const loopTicker = [...ticker, ...ticker, ...ticker];

  const primaryButtonClass =
    "group relative inline-flex min-h-[52px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-[#050505] via-[#111111] to-[#050505] px-7 py-4 font-[var(--font-ui-family)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#7a98af]/60 hover:shadow-[0_20px_60px_rgba(122,152,175,0.2)] sm:px-8";

  const secondaryButtonClass =
    "group relative inline-flex min-h-[52px] items-center justify-center overflow-hidden rounded-full border border-white/45 bg-white/[0.09] px-7 py-4 font-[var(--font-ui-family)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#b9d9eb]/65 hover:bg-white/[0.14] hover:shadow-[0_18px_50px_rgba(122,152,175,0.18)] sm:px-8";

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
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.68)_100%)]" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-28 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
          <p className="font-[var(--font-accent-family)] text-[clamp(0.85rem,1.1vw,1rem)] italic tracking-[0.08em] text-white/72">
            Industry Leadership Conference
          </p>

          <h1 className="mt-5 max-w-[12ch] font-[var(--font-title-family)] text-[clamp(3.1rem,9vw,7.6rem)] font-light leading-[0.86] tracking-[-0.045em] text-white [text-shadow:0_10px_38px_rgba(0,0,0,0.48)]">
            IBPA Beauty Award 2026
          </h1>

          <div className="mt-8 flex max-w-3xl flex-col items-center gap-5">
            <p className="max-w-[18ch] font-[var(--font-accent-family)] text-[clamp(1.75rem,3.4vw,3.15rem)] italic leading-[1.08] tracking-[-0.02em] text-white/86 [text-shadow:0_8px_28px_rgba(0,0,0,0.35)]">
              Beauty Business Forum & Beauty Award
            </p>

            <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-white/18 bg-black/22 px-5 py-2.5 font-[var(--font-accent-family)] text-[clamp(0.95rem,1.35vw,1.12rem)] italic text-white/78 backdrop-blur-xl">
              <span>September 25–26, 2026</span>
              <span className="hidden text-white/35 sm:inline">◆</span>
              <span>Los Angeles, California</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            {/* Primary CTA */}
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className={`${primaryButtonClass}`}
            >
              <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#7a98af]/10 opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
              <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-700 group-hover:inset-x-4 group-hover:via-[#b9d9eb]/70" />
              <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-[#b9d9eb]/25 before:to-transparent before:transition-all before:duration-700 group-hover:before:left-[130%]" />

              <span className="relative z-10">Buy Forum Tickets</span>

              <ArrowRight
                size={16}
                className="relative z-10 text-[#b9d9eb] transition-all duration-500 group-hover:translate-x-1 group-hover:text-white"
              />
            </button>

            {/* Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/apply"
                className={`${secondaryButtonClass}`}
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/14 via-white/[0.03] to-[#7a98af]/15 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
                <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b9d9eb]/0 to-transparent transition-all duration-700 group-hover:inset-x-4 group-hover:via-[#b9d9eb]/80" />
                <span className="absolute inset-[1px] rounded-full border border-[#b9d9eb]/0 transition-colors duration-700 group-hover:border-[#b9d9eb]/20" />
                <span className="absolute inset-0 before:absolute before:left-[-140%] before:top-0 before:h-full before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-all before:duration-700 group-hover:before:left-[140%]" />

                <span className="relative z-10">
                  {t.common.applyAsParticipant}
                </span>
              </Link>

              <Link
                href="/jury"
                className={`${secondaryButtonClass}`}
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

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </>
  );
}

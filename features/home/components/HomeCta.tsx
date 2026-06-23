"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import BuyTicketsButton from "@/features/tickets/components/BuyTicketsButton";
import { ButtonLayers, LANDING_PRIMARY_BTN_CLASS } from "@/shared/components/public";

const buttonClass = LANDING_PRIMARY_BTN_CLASS;

export default function HomeCta() {
  const { t } = useLanguage();
  const fc = t.home.finalCta;

  return (
    <section className="relative min-h-[680px] overflow-hidden bg-white md:min-h-[82vh]">
      <div className="absolute inset-0">
        <Image
          src="/images/gallery/0K9A4722.jpg"
          alt="IBPA Beauty Award"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.02)_48%,rgba(0,0,0,0.18)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[680px] items-center justify-center px-[var(--page-gutter)] py-[clamp(5rem,8vw,8rem)] md:min-h-[82vh]">
        <div className="max-w-4xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#172430] shadow-[0_10px_30px_rgba(20,49,71,0.14)] backdrop-blur-[12px]">
            <Sparkles size={13} />
            {fc.eyebrow}
          </div>

          <div className="rounded-[2.5rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.18))] px-6 py-9 shadow-[0_40px_120px_rgba(0,0,0,0.18)] backdrop-blur-[16px] sm:px-12 sm:py-11">
            <h2 className="font-[var(--font-title-family)] text-[clamp(2.8rem,7vw,6rem)] font-light uppercase leading-[0.9] tracking-[-0.045em] text-[#060712] [text-shadow:0_1px_0_rgba(255,255,255,0.55),0_6px_18px_rgba(255,255,255,0.18)]">
              {fc.title}
            </h2>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <BuyTicketsButton className={buttonClass}>
                <ButtonLayers />
                <span className="relative z-10">{fc.buyTicket}</span>
                <ArrowRight
                  size={16}
                  className="relative z-10 text-[#4d88b2] transition-all duration-500 group-hover:translate-x-1.5 group-hover:scale-110"
                />
              </BuyTicketsButton>

              <Link href="/apply" className={buttonClass}>
                <ButtonLayers />
                <span className="relative z-10">{fc.applyAward}</span>
                <ArrowRight
                  size={16}
                  className="relative z-10 text-[#4d88b2] transition-all duration-500 group-hover:translate-x-1.5 group-hover:scale-110"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

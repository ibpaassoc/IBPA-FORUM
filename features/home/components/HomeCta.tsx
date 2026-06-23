"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import BuyTicketsButton from "@/features/tickets/components/BuyTicketsButton";

const buttonClass =
  "group relative inline-flex min-h-[56px] items-center justify-center gap-3 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,252,255,0.78))] px-8 py-4 font-[var(--font-ui-family)] text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#0b1420] shadow-[0_1px_0_rgba(255,255,255,0.95),0_12px_34px_rgba(122,152,175,0.14),inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-[2px] hover:border-[#8eb6d3]/75 hover:shadow-[0_18px_50px_rgba(122,152,175,0.2)]";

function ButtonLayers() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
      <span className="absolute inset-x-8 top-[1px] h-[45%] rounded-full bg-gradient-to-b from-white/85 to-transparent" />
      <span className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[#72a0c1]/65 to-transparent opacity-70" />
      <span className="absolute inset-[1px] rounded-full border border-white/65" />
      <span className="absolute inset-0 before:absolute before:left-[-130%] before:top-0 before:h-full before:w-[40%] before:rotate-[18deg] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:transition-all before:duration-1000 group-hover:before:left-[140%]" />
    </>
  );
}

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

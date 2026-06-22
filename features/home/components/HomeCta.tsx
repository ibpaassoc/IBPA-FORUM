"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import BuyTicketsButton from "@/features/tickets/components/BuyTicketsButton";

export default function HomeCta() {
  const { t } = useLanguage();
  const fc = t.home.finalCta;

  return (
    <section className="relative min-h-[620px] overflow-hidden md:min-h-[72vh]">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/gallery/0K9A4722.jpg"
          alt="IBPA Beauty Award"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Soft white overlay — "less obvious", elegant */}
        <div className="absolute inset-0 bg-white/38" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.44)_100%)]" />
      </div>

      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="relative z-10 max-w-3xl space-y-8 text-center">
          <p className="font-[var(--font-ui-family)] text-[0.68rem] font-semibold uppercase tracking-[0.4em] text-[var(--color-blue)]">
            {fc.eyebrow}
          </p>

          <h2 className="font-[var(--font-title-family)] text-[clamp(2.4rem,5vw,4rem)] font-light uppercase leading-[0.94] tracking-[-0.03em] text-[var(--color-ink)] [text-shadow:0_2px_0_rgba(0,0,0,0.08),0_16px_32px_rgba(0,0,0,0.10)]">
            {fc.title}
          </h2>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <BuyTicketsButton className="inline-flex items-center gap-2.5 rounded-full bg-black px-10 py-5 font-[var(--font-ui-family)] text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-2xl transition-all duration-300 hover:scale-[1.04]">
              {fc.buyTicket} <ArrowRight size={15} />
            </BuyTicketsButton>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/72 px-10 py-5 font-[var(--font-ui-family)] text-xs font-semibold uppercase tracking-[0.14em] text-slate-800 transition-all duration-300 hover:bg-white"
            >
              {fc.applyAward}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

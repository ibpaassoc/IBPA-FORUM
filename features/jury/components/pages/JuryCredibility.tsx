"use client";

import Image from "next/image";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function JuryCredibility() {
  const { t } = useLanguage();

  return (
    <section
      className="relative min-h-[clamp(560px,76vh,820px)] overflow-hidden bg-white"
      aria-label={t.juryPage.copy.statementEyebrow}
    >
      <Image
        src="/images/gallery/DSC00598.jpg"
        alt="Jury panel"
        fill
        className="object-cover object-[50%_0%]"
        sizes="100vw"
        priority={false}
      />

      <div className="page-section relative z-10 flex min-h-[clamp(560px,76vh,820px)] items-center justify-end py-[clamp(4rem,8vw,7rem)]">
        <Reveal>
          <div className="relative w-full max-w-[39rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white/48 p-7 shadow-[0_30px_90px_rgba(35,62,82,0.14)] backdrop-blur-2xl md:p-10">
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.90)_0%,rgba(255,255,255,0.45)_54%,rgba(185,217,235,0.22)_100%)]"
            />

            <div className="relative">
              <p className="page-eyebrow mb-[var(--space-sm)]">
                {t.juryPage.copy.statementEyebrow}
              </p>

              <h2 className="font-[var(--font-title-family)] text-[clamp(2rem,4vw,3.75rem)] font-light leading-[0.98] tracking-[-0.045em] text-[var(--color-ink)]">
                {t.juryPage.copy.statementTitle}
              </h2>

              <p className="mt-6 max-w-md text-[0.98rem] leading-[1.85] text-[var(--color-ink-soft)]">
                {t.juryPage.copy.statementText}
              </p>

              {t.juryPage.copy.statementQuote ? (
                <blockquote className="mt-8 border-l-2 border-[var(--color-blue)] pl-5 font-[var(--font-accent-family)] text-[clamp(1.1rem,1.7vw,1.45rem)] italic leading-[1.5] text-[var(--color-ink-soft)]">
                  {t.juryPage.copy.statementQuote}
                </blockquote>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

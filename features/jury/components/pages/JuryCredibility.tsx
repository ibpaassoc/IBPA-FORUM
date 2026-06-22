"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal } from "@/shared/components/public";

export default function JuryCredibility() {
  const { t } = useLanguage();

  return (
    <section
      className="relative flex min-h-[580px] overflow-hidden"
      style={{ minHeight: "clamp(520px, 70vh, 760px)" }}
    >
      {/* Left half — clear, visible image */}
      <div className="hidden w-1/2 lg:block">
        <div className="relative h-full w-full">
          <Image
            src="/images/gallery/DSC00598.jpg"
            alt="Jury panel"
            fill
            className="object-cover object-center"
            sizes="50vw"
          />
        </div>
      </div>

      {/* Right half — same image blurred + white overlay + text */}
      <div className="relative flex-1">
        {/* Blurred background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/gallery/DSC00598.jpg"
            alt=""
            fill
            className="object-cover object-center blur-[6px] scale-105"
            sizes="50vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-white/72 backdrop-blur-sm" />
        </div>

        {/* Text content */}
        <div className="relative z-10 flex h-full flex-col justify-center px-10 py-16 md:px-16">
          <Reveal>
            <p className="page-eyebrow mb-[var(--space-sm)]">
              {t.juryPage.copy.statementEyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-[var(--font-title-family)] text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.08] text-[var(--color-ink)]">
              {t.juryPage.copy.statementTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-[var(--space-md)] max-w-md text-[0.96rem] leading-[1.78] text-[var(--color-ink-soft)]">
              {t.juryPage.copy.statementText}
            </p>
          </Reveal>

          {t.juryPage.copy.statementQuote ? (
            <Reveal delay={0.24}>
              <blockquote className="mt-[var(--space-lg)] border-l-2 border-[var(--color-blue)] pl-5 font-[var(--font-accent-family)] text-[clamp(1.05rem,1.6vw,1.35rem)] italic leading-[1.5] text-[var(--color-ink-soft)]">
                {t.juryPage.copy.statementQuote}
              </blockquote>
            </Reveal>
          ) : null}
        </div>
      </div>

      {/* Mobile image (stacked above text) */}
      <div className="absolute inset-0 -z-10 lg:hidden">
        <Image
          src="/images/gallery/DSC00598.jpg"
          alt="Jury panel"
          fill
          className="object-cover object-center opacity-20"
          sizes="100vw"
        />
      </div>
    </section>
  );
}

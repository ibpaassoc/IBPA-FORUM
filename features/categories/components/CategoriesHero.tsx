"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CategoriesHero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="/images/events/CategoriesHero2.jpg"
          alt="IBPA Award Categories"
          fill
          style={{ objectPosition: "center 34%" }}
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex w-full flex-col items-center px-[var(--page-gutter)] pb-24 pt-[calc(var(--site-header-height)+clamp(2rem,6vw,5rem))] text-center">
        <p className="font-[var(--font-accent-family)] text-[clamp(0.9rem,1.4vw,1.15rem)] italic tracking-wide text-white/70">
          {t.categoriesPage.hero.eyebrow}
        </p>

        <h1 className="mt-4 max-w-[14ch] font-[var(--font-title-family)] text-[clamp(3rem,10vw,7.5rem)] font-light leading-[0.90] tracking-[-0.03em] text-white [text-shadow:0_8px_32px_rgba(0,0,0,0.45)]">
          {t.categoriesPage.hero.title}
        </h1>

        <p className="mt-6 max-w-lg font-[var(--font-accent-family)] text-[clamp(1rem,1.8vw,1.25rem)] italic leading-[1.65] text-white/80">
          {t.categoriesPage.hero.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2.5 rounded-full bg-black px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white shadow-2xl transition-all duration-300 hover:scale-[1.04] hover:bg-[var(--color-blue)]"
          >
            {t.common.applyAsParticipant} <ArrowRight size={16} />
          </Link>
          <Link
            href="#categories"
            className="inline-flex items-center rounded-full border border-white/50 bg-white/10 px-8 py-4 font-[var(--font-ui-family)] text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
          >
            {t.categoriesPage.hero.secondary ?? "Browse Categories"}
          </Link>
        </div>
      </div>
    </section>
  );
}

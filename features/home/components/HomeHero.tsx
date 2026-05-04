"use client";

import Link from "next/link";
import Countdown from "@/features/home/components/Countdown";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,194,122,0.22),transparent_38%)]"/>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 md:px-10 py-32 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
            {t.home.hero.eyebrow}
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
            {t.home.hero.title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#d9d4ca] md:text-lg">
            {t.home.hero.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
            >
              {t.common.applyNow}
            </Link>

            <Link
              href="/categories"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              {t.home.hero.categoriesCta}
            </Link>
          </div>

          <Countdown />
        </div>
      </div>
    </section>
  );
}

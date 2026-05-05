"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="border-t border-white/10 bg-[linear-gradient(180deg,#141415_0%,#0f0f10_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 lg:px-12">
        <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
          {t.home.cta.label}
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">
          {t.home.cta.title}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#d9d4ca]">
          {t.home.cta.text}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apply"
            className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
          >
            {t.common.applyNow}
          </Link>

          <Link
            href="/jury"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            {t.home.cta.judge}
          </Link>
        </div>
      </div>
    </section>
  );
}

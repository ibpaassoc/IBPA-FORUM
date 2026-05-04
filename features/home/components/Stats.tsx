"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Stats() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {t.home.stats.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[#d8c27a]">
              {item.title}
            </p>
            <p className="mt-4 text-2xl font-semibold text-white md:text-3xl">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#d9d4ca]">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

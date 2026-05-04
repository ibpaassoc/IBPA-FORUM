"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryRequirements() {
  const { t } = useLanguage();

  return (
    <section id="requirements" className="border-b border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
            {t.juryPage.requirements.label}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            {t.juryPage.requirements.title}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {t.juryPage.requirements.items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-[#d9d4ca]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client";

import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Process() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
      <SectionTitle
        label={t.home.process.label}
        title={t.home.process.title}
        className="max-w-2xl"
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-5">
        {t.home.process.steps.map((step) => (
          <div
            key={step.number}
            className="rounded-3xl border border-white/10 bg-[#171718] p-6"
          >
            <div className="text-sm tracking-[0.25em] text-[#d8c27a]">
              {step.number}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#c8c2b5]">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

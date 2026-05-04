"use client";

import SectionTitle from "@/shared/components/ui/SectionTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function FAQ() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <SectionTitle
          label={t.home.faq.label}
          title={t.home.faq.title}
          className="max-w-2xl"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {t.home.faq.items.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl border border-white/10 bg-[#171718] p-7"
            >
              <h3 className="text-xl font-semibold text-white">{item.q}</h3>
              <p className="mt-4 text-sm leading-7 text-[#c8c2b5]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

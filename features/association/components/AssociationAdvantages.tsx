"use client";

import { BadgeCheck } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AssociationAdvantages() {
  const { t } = useLanguage();
  const c = t.associationPage.advantages;

  const shortItems = c.items.map((item) => item.split(" и ")[0].split(" та ")[0]);

  return (
    <section className="landing-section-strong relative overflow-hidden py-20 md:py-28">
      <div className="absolute left-[-14%] top-0 h-[26rem] w-[26rem] rounded-full bg-[#b9d9eb]/16 blur-2xl" />

      <div className="page-section relative">
        <div className="max-w-4xl">
          <p className="page-eyebrow">{c.eyebrow}</p>

          <h2 className="mt-4 font-[var(--font-title-family)] text-[clamp(2.8rem,6vw,6rem)] font-light leading-[0.9] tracking-[-0.06em] text-[#111827]">
            {c.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortItems.map((item, index) => (
            <article
              key={`${item}-${index}`}
              className="group relative min-h-[150px] overflow-hidden rounded-[32px] border border-white/70 bg-white/68 p-5 shadow-[0_18px_52px_rgba(114,160,193,0.1)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#b9d9eb]/20 blur-2xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f5876] text-white shadow-[0_14px_30px_rgba(31,88,118,0.22)]">
                  <BadgeCheck size={17} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#72a0c1]">
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <h3 className="mt-3 text-[0.98rem] font-[var(--font-body-family)] leading-snug text-[#17212b]">
                    {item}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

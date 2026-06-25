"use client"

import { GraduationCap, Landmark, Palette, Sparkles, Store } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const icons = [Palette, GraduationCap, Landmark, Store, Sparkles];

export default function AssociationWhoCanJoin() {
  const { t } = useLanguage();
  const c = t.associationPage.whoCanJoin;

  return (
    <section className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="absolute left-[-16%] top-10 h-80 w-80 rounded-full bg-[#b9d9eb]/16 blur-2xl" />

      <div className="page-section relative">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="page-eyebrow">{c.eyebrow}</p>

            <h2 className="mt-4 max-w-3xl font-[var(--font-body)] text-[clamp(2.65rem,5.8vw,6rem)] font-light leading-[0.9] tracking-[-0.06em] text-[#111827]">
              {c.title}
            </h2>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {c.items.map((title, index) => {
            const Icon = icons[index] ?? Sparkles;

            return (
              <article
                key={title}
                className="group relative min-h-[220px] overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 bg-white/66 p-6 shadow-[0_18px_56px_rgba(114,160,193,0.11)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#b9d9eb]/22 blur-2xl" />

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-[#b9d9eb]/32 text-[#1f5876] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <Icon size={22} strokeWidth={1.6} />
                </div>

                <div className="relative mt-12">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#72a0c1]">
                    0{index + 1}
                  </p>

                  <h3 className="text-[1.05rem] font-semibold leading-snug text-[#17212b]">
                    {title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

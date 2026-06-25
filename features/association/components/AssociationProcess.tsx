"use client";

import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AssociationProcess() {
  const { t } = useLanguage();
  const c = t.associationPage.process;

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute left-[-12%] top-16 h-96 w-96 rounded-full bg-[#b9d9eb]/24 blur-3xl" />
      <div className="absolute bottom-[-18%] right-[-12%] h-[30rem] w-[30rem] rounded-full bg-[#72a0c1]/12 blur-3xl" />

      <div className="page-section relative">
        <div className="mx-auto max-w-4xl text-center">
          <p className="page-eyebrow">{c.eyebrow}</p>

          <h2 className="mt-4 font-[var(--font-title-family)] text-[clamp(2.75rem,6vw,6rem)] font-light leading-[0.9] tracking-[-0.06em] text-[#111827]">
            {c.title}
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#b9d9eb]/80 to-transparent lg:block" />

          <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {c.steps.map((step, index) => (
              <article
                key={step.title}
                className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-[34px] border border-[#b9d9eb]/45 bg-white/72 p-6 shadow-[0_24px_70px_rgba(114,160,193,0.12)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white"
              >

                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1f5876] text-sm font-semibold text-white shadow-[0_14px_34px_rgba(31,88,118,0.24)]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative flex flex-1 items-center py-8">
                  <h3 className="text-xl font-[var(--font-body-family)] leading-tight text-[#17212b]">
                    {step.title}
                  </h3>
                </div>

                <p className="relative text-sm leading-7 text-[#536776]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useLanguage();

  return (
    <section className="border-b border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
            {t.juryPage.faq.label}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            {t.juryPage.faq.title}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {t.juryPage.faq.items.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={faq.question}
                className="border-b border-white/10 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left"
                >
                  <span className="text-sm font-medium text-white sm:text-base">
                    {faq.question}
                  </span>
                  <span className="text-xl text-[#d8c27a]">{isOpen ? "-" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="max-w-3xl text-sm leading-6 text-[#d9d4ca]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

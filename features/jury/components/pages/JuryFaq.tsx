"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useLanguage();

  return (
    <section>
      <div className="mx-auto max-w-(--content-width) px-(--page-gutter) page-section-pad">
        <div className="mb-(--space-lg) max-w-3xl">
          <p className="page-eyebrow">
            {t.juryPage.faq.label}
          </p>
          <h2 className="mt-(--space-sm) font-(--font-display) text-[clamp(1.8rem,3.5vw,3rem)] leading-[1.15] text-(--color-navy)">
            {t.juryPage.faq.title}
          </h2>
        </div>

        <div className="rounded-(--radius) border border-(--border-default) bg-(--color-white) shadow-(--shadow-sm)">
          {t.juryPage.faq.items.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={faq.question}
                className="border-b border-(--border-default) last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-(--space-md) px-(--space-md) py-(--space-md) text-left"
                >
                  <span className="text-sm font-medium text-(--color-navy) sm:text-base">
                    {faq.question}
                  </span>
                  <span className="text-xl text-(--color-gold)">{isOpen ? "-" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="max-w-3xl text-sm leading-[1.65] text-(--color-steel)">
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

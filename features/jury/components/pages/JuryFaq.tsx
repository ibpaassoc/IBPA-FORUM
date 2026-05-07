"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JuryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--color-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="mb-[var(--space-lg)] max-w-3xl">
          <p className="page-eyebrow">
            {t.juryPage.faq.label}
          </p>
          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-[var(--color-navy)]">
            {t.juryPage.faq.title}
          </h2>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]">
          {t.juryPage.faq.items.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={faq.question}
                className="border-b border-[var(--border-default)] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-[var(--space-md)] px-[var(--space-md)] py-[var(--space-md)] text-left"
                >
                  <span className="text-sm font-medium text-[var(--color-navy)] sm:text-base">
                    {faq.question}
                  </span>
                  <span className="text-xl text-[var(--color-gold)]">{isOpen ? "-" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="max-w-3xl text-sm leading-[1.65] text-[var(--color-steel)]">
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

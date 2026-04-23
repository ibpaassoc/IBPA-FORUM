"use client"

import { useState } from "react"

const faqs = [
  {
    question: "Do I pay when I submit the application?",
    answer:
      "No. Jury applications are submitted free of charge. The $250 fee is charged only after approval.",
  },
  {
    question: "How long does the review take?",
    answer:
      "Applications are reviewed individually and may take up to 14 business days.",
  },
  {
    question: "Will every applicant be accepted?",
    answer:
      "No. Approval depends on professional background, qualifications, and jury fit.",
  },
  {
    question: "What happens after approval?",
    answer:
      "Approved candidates receive payment instructions. After payment confirmation, they officially join the jury panel.",
  },
]

export default function JuryFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-b border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
            Questions
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {faqs.map((faq, index) => {
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

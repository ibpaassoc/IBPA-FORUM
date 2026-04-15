const faqs = [
  {
    question: "Do I pay when I submit the application?",
    answer:
      "No. Jury applications are submitted free of charge. The $250 fee is paid only after approval.",
  },
  {
    question: "How long does the review take?",
    answer:
      "Applications may be reviewed within up to 14 business days after submission.",
  },
  {
    question: "Will all applicants be accepted?",
    answer:
      "No. Each application is reviewed individually based on professional experience, qualifications, and fit for the jury panel.",
  },
  {
    question: "What happens after approval?",
    answer:
      "Approved candidates receive payment instructions. After payment confirmation, they are officially added to the jury panel.",
  },
]

export default function JuryFaq() {
  return (
    <section className="border-b border-black/10 bg-[#fcfcfc]">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#b48a2c]">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Common questions
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-3xl border border-black/10 bg-white p-6"
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <p className="mt-3 text-base leading-7 text-black/70">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

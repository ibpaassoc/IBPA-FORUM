const steps = [
  {
    number: "01",
    title: "Submit your application",
    text: "Complete the jury application form and upload all required professional materials.",
  },
  {
    number: "02",
    title: "Application review",
    text: "IBPA reviews each submission individually. Review may take up to 14 business days.",
  },
  {
    number: "03",
    title: "Approval decision",
    text: "Approved candidates receive an official email invitation and payment instructions.",
  },
  {
    number: "04",
    title: "Registration payment",
    text: "Only approved judges pay the $250 jury registration fee via Stripe Checkout.",
  },
  {
    number: "05",
    title: "Official confirmation",
    text: "After successful payment, the judge receives official confirmation and is added to the jury panel.",
  },
]

export default function JuryProcess() {
  return (
    <section className="border-b border-black/10 bg-[#fcfcfc]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#b48a2c]">
            Process
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            How the jury application works
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-[1.75rem] border border-black/10 bg-white p-6"
            >
              <p className="text-sm font-semibold tracking-[0.2em] text-[#b48a2c]">
                {step.number}
              </p>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-black/70">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

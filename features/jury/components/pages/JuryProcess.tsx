const steps = [
  {
    number: "01",
    title: "Submit Application",
    text: "Complete the jury application form and upload all required materials.",
  },
  {
    number: "02",
    title: "IBPA Review",
    text: "Your professional background, experience, and documents are reviewed.",
  },
  {
    number: "03",
    title: "Receive Decision",
    text: "Approved candidates receive an official email with the next steps.",
  },
  {
    number: "04",
    title: "Complete Payment",
    text: "Only approved candidates are invited to pay the $250 jury fee.",
  },
  {
    number: "05",
    title: "Join the Panel",
    text: "After payment confirmation, you become an official jury panel member.",
  },
]

export default function JuryProcess() {
  return (
    <section className="border-b border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
            Process
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            How the jury application works
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                {step.number}
              </p>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#d9d4ca]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

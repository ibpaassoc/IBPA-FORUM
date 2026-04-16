const items = [
  {
    label: "Minimum Experience",
    value: "5+ Years",
    text: "Applicants must have at least five years of professional industry experience.",
  },
  {
    label: "Expertise",
    value: "12 Categories",
    text: "Judges are selected based on their expertise in relevant championship areas.",
  },
  {
    label: "Documents",
    value: "Required",
    text: "Professional certifications, bio, and profile materials must be submitted.",
  },
  {
    label: "Payment Rule",
    value: "After Approval",
    text: "The jury fee is never charged at the application stage.",
  },
]

export default function JuryRequirements() {
  return (
    <section id="requirements" className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
            Requirements
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Who can apply for the jury panel
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/12 bg-white/3 p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-white/65">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

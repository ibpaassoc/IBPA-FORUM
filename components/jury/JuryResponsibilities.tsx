const responsibilities = [
  {
    number: "01",
    title: "Review category entries",
    text: "Evaluate submissions only within approved areas of expertise and according to championship standards.",
  },
  {
    number: "02",
    title: "Maintain confidentiality",
    text: "All judging deliberations, materials, and candidate information must remain confidential.",
  },
  {
    number: "03",
    title: "Declare conflicts",
    text: "Any connection to nominees, schools, salons, or brands must be disclosed in advance.",
  },
  {
    number: "04",
    title: "Support fair evaluation",
    text: "Judges are expected to apply neutral, professional, and ethical decision-making.",
  },
]

export default function JuryResponsibilities() {
  return (
    <section className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
            Responsibilities
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            What official judges are expected to do
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {responsibilities.map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-white/12 bg-white/3 p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
                {item.number}
              </p>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const responsibilities = [
  {
    number: "01",
    title: "Review direction entries",
    text: "Evaluate submissions only within approved areas of expertise and according to award standards.",
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
    <section className="bg-[var(--color-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="mb-[var(--space-lg)] max-w-3xl">
          <p className="page-eyebrow">
            Responsibilities
          </p>
          <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-[var(--color-ink)]">
            What official judges are expected to do
          </h2>
        </div>

        <div className="grid gap-[var(--space-md)] lg:grid-cols-4">
          {responsibilities.map((item) => (
            <div
              key={item.number}
              className="page-card p-[var(--space-md)]"
            >
              <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.18em] text-[var(--color-hover)]">
                {item.number}
              </p>
              <h3 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(1.1rem,2vw,1.6rem)] font-normal text-[var(--color-ink)]">{item.title}</h3>
              <p className="mt-[var(--space-sm)] text-sm leading-[1.65] text-[var(--color-ink-soft)]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

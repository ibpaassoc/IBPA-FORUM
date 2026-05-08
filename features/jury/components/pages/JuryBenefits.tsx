export default function JuryBenefits() {
  return (
    <section className="bg-[var(--color-off-white)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)] py-[var(--space-2xl)]">
        <div className="page-card p-[var(--space-lg)]">
          <p className="page-eyebrow">
            Benefits
          </p>

          <div className="mt-[var(--space-md)] grid gap-[var(--space-lg)] lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <h2 className="font-[var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light leading-[1.15] text-[var(--color-navy)]">
                What approved judges receive
              </h2>
              <p className="mt-[var(--space-sm)] max-w-2xl text-sm leading-[1.7] text-[var(--color-steel)]">
                After approval and payment, official judges receive formal recognition,
                supporting documents, and public listing as part of the championship jury panel.
              </p>
            </div>

            <div className="space-y-[var(--space-sm)]">
              {[
                "Official invitation to serve on the IBPA jury panel.",
                "Personalized jury certificate for the championship year.",
                "Official letter of appreciation from the IBPA President.",
                "Professional contribution letter for industry recognition.",
                "Public jury profile with photo and biography.",
              ].map((item) => (
                <div key={item} className="border-b border-[var(--border-default)] pb-[var(--space-sm)]">
                  <p className="text-sm leading-[1.65] text-[var(--color-navy)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

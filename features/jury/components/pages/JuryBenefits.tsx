"use client";

export default function JuryBenefits() {
  const benefits = [
    "Official invitation to serve on the IBPA jury panel.",
    "Personalized jury certificate for the award year.",
    "Official letter of appreciation from the IBPA President.",
    "Professional contribution letter for industry recognition.",
    "Public jury profile with photo and biography.",
  ];

  return (
    <section className="bg-[var(--color-off-white)] py-[var(--space-2xl)]">
      <div className="mx-auto max-w-[var(--content-width)] px-[var(--page-gutter)]">
        <div className="grid gap-[var(--space-xl)] lg:grid-cols-[1fr_1.2fr] lg:items-start">

          <div>
            <p className="page-eyebrow">Benefits</p>
            <h2 className="mt-[var(--space-sm)] font-[var(--font-title-family)] text-[clamp(1.8rem,3.5vw,3.2rem)] font-light leading-[1.12] text-[var(--color-ink)]">
              What approved judges receive
            </h2>
            <p className="mt-[var(--space-sm)] text-[0.95rem] leading-[1.78] text-[var(--color-ink-soft)]">
              After approval and payment, official judges receive formal recognition,
              supporting documents, and public listing as part of the award jury panel.
            </p>
          </div>

          <div className="rounded-[var(--radius)] border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden">
            {benefits.map((item, i) => (
              <div
                key={item}
                className={`flex items-start gap-4 px-[var(--space-lg)] py-[var(--space-md)] ${
                  i < benefits.length - 1 ? "border-b border-[var(--border-soft)]" : ""
                }`}
              >
                <span className="mt-0.5 shrink-0 font-[var(--font-ui-family)] text-[0.68rem] font-black tracking-[0.08em] text-[var(--color-hover-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[0.93rem] leading-[1.7] text-[var(--color-ink)]">{item}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

import Link from "next/link"

const highlights = [
  {
    label: "Review Window",
    value: "Up to 14 Business Days",
    text: "Every application is reviewed individually by the IBPA team.",
  },
  {
    label: "Jury Fee",
    value: "$250",
    text: "The payment request is sent only after the candidate is approved.",
  },
  {
    label: "Experience",
    value: "5+ Years",
    text: "Applicants should show a strong professional record in their field.",
  },
]

export default function JuryApplyHero() {
  return (
    <section className="border-b border-(--border-default) bg-[radial-gradient(circle_at_top_left,rgba(185,217,235,0.32),transparent_35%),linear-gradient(135deg,var(--color-white),var(--color-blue-wash)_58%,var(--color-blue-soft))] text-(--color-ink)">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-32 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-(--color-title-accent)">
            Official Jury Application
          </p>

          <p className="script-accent mt-4 text-[clamp(1.55rem,3vw,2.4rem)] text-(--color-title-accent)">
            Expert eyes, elevated standards
          </p>

          <h1 className="mt-3 max-w-3xl font-(--font-display) text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
            Submit your candidacy for the IBPA jury panel
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-(--color-ink-soft) sm:text-base">
            This application is designed for experienced beauty professionals,
            educators, salon leaders, and brand experts who want to serve on the
            official IBPA Beauty Championship jury panel. Approved judges receive
            formal recognition, supporting documents, and a public jury profile
            after payment confirmation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#jury-application-form"
              className="ibpa-button ibpa-button-gold"
            >
              Start Application
            </a>

            <Link
              href="/jury"
              className="ibpa-button ibpa-button-ghost"
            >
              Review Jury Page
            </Link>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-(--border-default) bg-white/70 p-6 shadow-(--shadow-sm) backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-(--color-ink-muted)">
            Before You Apply
          </p>

          <div className="mt-5 grid gap-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-(--border-default) bg-(--color-white) p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-(--color-ink-muted)">
                  {item.label}
                </p>
                <p className="mt-2 font-(--font-display) text-xl font-light sm:text-2xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-(--color-ink-soft)">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[rgba(185,217,235,0.55)] bg-(--color-blue-wash) p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-(--color-title-accent)">
              Ethics
            </p>
            <p className="mt-3 text-sm leading-6 text-(--color-ink-soft)">
              Jury candidates must disclose conflicts of interest and agree to
              keep all judging deliberations confidential.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

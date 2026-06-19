import Link from "next/link"
import EditorialImageCard from "@/shared/components/media/EditorialImageCard"

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
            official IBPA Beauty Award jury panel. Approved judges receive
            formal recognition, supporting documents, and a public jury profile
            after payment confirmation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#jury-application-form"
              className="ibpa-button ibpa-button-blue"
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

        <EditorialImageCard
          src="/images/editorial/accending.jpg"
          alt="Professional beauty excellence image for jury application"
          eyebrow="Before you apply"
          title="Expert eyes, elevated standards"
          text="The jury application flow now feels more connected to the editorial side of the site."
          aspectClassName="aspect-[4/5]"
          objectPosition="center 20%"
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="shadow-[0_22px_64px_rgba(12,16,20,0.14)]"
        >
          <div className="grid gap-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  {item.label}
                </p>
                <p className="mt-2 font-(--font-display) text-[clamp(1rem,2vw,1.35rem)] font-light text-white">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">{item.text}</p>
              </div>
            ))}
            <div className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-title-accent)]">
                Ethics
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Jury candidates must disclose conflicts of interest and agree to
                keep all judging deliberations confidential.
              </p>
            </div>
          </div>
        </EditorialImageCard>
      </div>
    </section>
  )
}

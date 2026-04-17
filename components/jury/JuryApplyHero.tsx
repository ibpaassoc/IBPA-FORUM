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
    <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,194,122,0.18),transparent_35%),linear-gradient(to_right,#151515,#0f0f10_55%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
            Official Jury Application
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Submit your candidacy for the IBPA jury panel
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d9d4ca] sm:text-base">
            This application is designed for experienced beauty professionals,
            educators, salon leaders, and brand experts who want to serve on the
            official IBPA Beauty Championship jury panel. Approved judges receive
            formal recognition, supporting documents, and a public jury profile
            after payment confirmation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#jury-application-form"
              className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90"
            >
              Start Application
            </a>

            <Link
              href="/jury"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Review Jury Page
            </Link>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Before You Apply
          </p>

          <div className="mt-5 grid gap-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold sm:text-2xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#d9d4ca]">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#d8c27a]/25 bg-[#d8c27a]/8 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Ethics
            </p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Jury candidates must disclose conflicts of interest and agree to
              keep all judging deliberations confidential.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

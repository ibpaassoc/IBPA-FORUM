import Link from "next/link"

export default function JuryHero() {
  return (
    <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(180,138,44,0.18),transparent_35%),linear-gradient(to_right,#151515,#050505_55%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
            IBPA Beauty Championship 2026
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Apply to become an official IBPA judge
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Jury candidates must demonstrate professional experience, recognized
            expertise, and ethical judgment. After approval and payment, judges
            receive official confirmation, documents, and a public profile on the jury page.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply/jury"
              className="inline-flex items-center justify-center rounded-full bg-[#d6a63a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90"
            >
              Apply as Judge
            </Link>

            <a
              href="#requirements"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d6a63a] hover:text-[#d6a63a]"
            >
              View Requirements
            </a>
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-white/12 bg-white/3 p-6 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Jury Overview
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                Experience
              </p>
              <p className="mt-2 text-2xl font-semibold">5+ Years</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                Review
              </p>
              <p className="mt-2 text-2xl font-semibold">Up to 14 Business Days</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                Fee
              </p>
              <p className="mt-2 text-2xl font-semibold">$250</p>
              <p className="mt-1 text-xs text-white/55">Charged only after approval</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

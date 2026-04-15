import Link from "next/link"

export default function JuryHero() {
  return (
    <section className="border-b border-black/10 bg-[#f8f5ef]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-20 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#b48a2c]">
            IBPA Beauty Championship
          </p>

          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Join the Official Jury Panel
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-black/70 sm:text-lg">
            Experienced beauty professionals are invited to apply to become official judges
            of the IBPA Beauty Championship. All jury applications are reviewed individually,
            and approved judges receive official recognition, certification, and public listing.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/apply/jury"
              className="inline-flex items-center justify-center rounded-full bg-[#b48a2c] px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:opacity-90"
            >
              Apply to Become a Judge
            </Link>

            <a
              href="#requirements"
              className="inline-flex items-center justify-center rounded-full border border-black/15 px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-black hover:text-white"
            >
              View Requirements
            </a>
          </div>
        </div>

        <div className="grid gap-4 rounded-4xl border border-black/10 bg-white p-6 shadow-sm sm:grid-cols-3 lg:w-105 lg:grid-cols-1">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-black/50">Experience</p>
            <p className="mt-2 text-2xl font-semibold">5+ Years</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-black/50">Review Time</p>
            <p className="mt-2 text-2xl font-semibold">Up to 14 Business Days</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-black/50">Fee</p>
            <p className="mt-2 text-2xl font-semibold">$250 After Approval</p>
          </div>
        </div>
      </div>
    </section>
  )
}

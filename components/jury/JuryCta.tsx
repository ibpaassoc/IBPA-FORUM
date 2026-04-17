import Link from "next/link"

export default function JuryCta() {
  return (
    <section className="bg-[#0f0f10]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="rounded-[1.25rem] border border-white/10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04),rgba(216,194,122,0.12))] p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
            Jury
          </p>

          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            Apply to become an official IBPA judge
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
            Jury candidates must demonstrate professional experience, recognized
            expertise, and ethical judgment. After approval, judges receive official
            confirmation, supporting documents, and a public profile on the jury page.
          </p>

          <Link
            href="/apply/jury"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90"
          >
            Apply as Judge
          </Link>
        </div>
      </div>
    </section>
  )
}

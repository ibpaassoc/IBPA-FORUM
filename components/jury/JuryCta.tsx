import Link from "next/link"

export default function JuryCta() {
  return (
    <section className="bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="rounded-[1.25rem] border border-white/12 bg-[linear-gradient(to_right,rgba(255,255,255,0.03),rgba(214,166,58,0.10))] p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
            Jury
          </p>

          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            Apply to become an official IBPA judge
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            Jury candidates must demonstrate professional experience, recognized
            expertise, and ethical judgment. After approval, judges receive official
            confirmation, supporting documents, and a public profile on the jury page.
          </p>

          <Link
            href="/apply/jury"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[#d6a63a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90"
          >
            Apply as Judge
          </Link>
        </div>
      </div>
    </section>
  )
}

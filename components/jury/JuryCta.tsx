import Link from "next/link"

export default function JuryCta() {
  return (
    <section className="bg-[#1f1f1f] text-white">
      <div className="mx-auto max-w-5xl px-6 py-20 text-center md:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#d6b15c]">
          Apply Now
        </p>

        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Ready to join the IBPA jury panel?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/75">
          Submit your application and become part of the official judging panel
          for the IBPA Beauty Championship.
        </p>

        <Link
          href="/apply/jury"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#b48a2c] px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:opacity-90"
        >
          Apply to Become a Judge
        </Link>
      </div>
    </section>
  )
}

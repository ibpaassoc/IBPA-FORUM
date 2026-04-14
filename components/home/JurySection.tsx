export default function JurySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
      <div className="rounded-4xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
          Jury
        </p>

        <h2 className="mt-4 text-3xl font-semibold text-white">
          Apply to become an official IBPA judge
        </h2>

        <p className="mt-5 text-sm leading-8 text-[#d9d4ca]">
          Jury candidates submit a professional application first. Approved
          experts then receive a Stripe payment link for the official $250
          registration fee.
        </p>

        <p className="mt-4 text-sm leading-8 text-[#d9d4ca]">
          After payment, judges receive confirmation, official documents, and a
          public profile on the jury page.
        </p>

        <a
          href="/jury"
          className="mt-8 inline-block rounded-full bg-[#d8c27a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
        >
          Apply as Judge
        </a>
      </div>
    </section>
  );
}

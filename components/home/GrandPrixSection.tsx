export default function GrandPrixSection() {
  return (
    <section className="border-y border-white/10 bg-[#141415]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="rounded-4xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
            Grand Prix
          </p>

          <h2 className="mt-4 text-3xl font-semibold text-white">
            Prestige protected by category diversity
          </h2>

          <p className="mt-5 text-sm leading-8 text-[#d9d4ca]">
            The Grand Prix is not a direct application. It is selected by the
            full jury panel from category winners only in years where at least 5
            categories produce award recipients.
          </p>

          <p className="mt-4 text-sm leading-8 text-[#d9d4ca]">
            This keeps the title meaningful, competitive, and representative of
            a strong championship year.
          </p>

          <a
            href="/grand-prix"
            className="mt-8 inline-block rounded-full border border-[#d8c27a]/50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#d8c27a] transition hover:bg-[#d8c27a] hover:text-[#111111]"
          >
            Learn About Grand Prix
          </a>
        </div>
      </div>
    </section>
  );
}

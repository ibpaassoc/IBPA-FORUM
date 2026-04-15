import Countdown from "@/components/home/Countdown";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(216,194,122,0.22),transparent_38%)]" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-28">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
            IBPA Beauty Championship 2026
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
            Recognizing excellence across beauty, education, wellness, and brand
            innovation.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#d9d4ca] md:text-lg">
            A premium championship experience for licensed professionals,
            educators, salons, and brands. Apply in your category, submit your
            portfolio, and be reviewed by the official IBPA jury panel.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/apply"
              className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
            >
              Apply Now
            </a>

            <a
              href="/categories"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Explore Categories
            </a>
          </div>

          <Countdown />
        </div>
      </div>
    </section>
  );
}

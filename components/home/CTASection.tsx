import Link from "next/link";

export default function CTASection() {
  return (
    <section className="border-t border-white/10 bg-[linear-gradient(180deg,#141415_0%,#0f0f10_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 lg:px-12">
        <p className="text-xs uppercase tracking-[0.32em] text-[#d8c27a]">
          Ready to participate?
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">
          Start your IBPA Beauty Championship application today.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#d9d4ca]">
          Build your professional case, upload your portfolio, and compete for
          one of the industry’s premier recognitions.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apply"
            className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
          >
            Apply Now
          </Link>

          <Link
            href="/jury"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            Become a Judge
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export default function GrandPrixCTA() {
  return (
    <section className="section-rhythm-loose px-[var(--page-gutter)]">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[36px] border border-black/8 bg-white p-8 shadow-[0_24px_60px_rgba(3,2,19,0.06)] md:p-10">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-hover-accent)]">
            Award participation
          </p>
          <h3 className="mt-4 max-w-xl font-[var(--font-display)] text-[clamp(2.1rem,3.6vw,3.5rem)] leading-[0.96] tracking-[-0.03em] text-[var(--color-ink)]">
            Participation cost with Grand Prix access built in.
          </h3>
          <p className="mt-5 max-w-2xl text-[1rem] leading-[1.85] text-[var(--color-ink-soft)]">
            Enter the main award with the nomination path that fits your profile. When you submit five or more nominations, Grand Prix consideration is included automatically.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-black"
            >
              Apply now <ArrowRight size={15} />
            </Link>

            <Link
              href="/grand-prix"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-all duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <Trophy size={14} strokeWidth={1.7} />
              Learn more
            </Link>
          </div>
        </article>

        <article className="rounded-[36px] bg-[var(--color-ink)] p-8 text-white shadow-[0_24px_60px_rgba(3,2,19,0.12)] md:p-10">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-white/65">
            Nomination fees
          </p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/62">
                Members
              </p>
              <p className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-white">
                $50
              </p>
              <p className="mt-1 text-[0.78rem] leading-[1.6] text-white/55">
                Per nomination submission
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/62">
                Non-members
              </p>
              <p className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-white">
                $70
              </p>
              <p className="mt-1 text-[0.78rem] leading-[1.6] text-white/55">
                Per nomination submission
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/62">
                Grand Prix
              </p>
              <p className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-white">
                5+
              </p>
              <p className="mt-1 text-[0.78rem] leading-[1.6] text-white/55">
                Nominations activate eligibility
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, Globe2, Sparkles } from "lucide-react";

export default function AssociationHero() {
  return (
    <section className="relative min-h-[680px] overflow-hidden bg-white md:min-h-[84vh]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,217,235,0.55),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(114,160,193,0.26),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7fbfd_100%)]" />

      <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-[#b9d9eb]/40 blur-3xl" />
      <div className="absolute -right-28 bottom-10 h-96 w-96 rounded-full bg-[#72a0c1]/20 blur-3xl" />

      <div className="page-section relative flex min-h-[680px] items-center py-24 md:min-h-[84vh]">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b9d9eb]/55 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#4f7f9d] shadow-[0_18px_50px_rgba(114,160,193,0.14)] backdrop-blur-2xl">
            <Sparkles size={14} />
            IBPA Association
          </div>

          <h1 className="mt-8 max-w-5xl font-(--font-display) text-[clamp(3.1rem,8vw,7.6rem)] leading-[0.92] tracking-[-0.065em] text-[#111827]">
            International Beauty Professionals Association
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#536776] md:text-xl">
            Международная ассоциация профессионалов индустрии красоты,
            объединяющая специалистов, преподавателей, владельцев бизнеса,
            академии, студии, салоны и бренды из разных стран мира.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#1f5876] px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_22px_50px_rgba(31,88,118,0.28)] transition hover:-translate-y-0.5"
            >
              Подать заявку
              <ArrowRight className="ml-2 transition group-hover:translate-x-1" size={16} />
            </Link>

            <Link
              href="https://ibpassociation.com"
              target="_blank"
              className="inline-flex items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/55 px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#1f5876] backdrop-blur-xl transition hover:bg-white"
            >
              <Globe2 className="mr-2" size={16} />
              Сайт IBPA
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

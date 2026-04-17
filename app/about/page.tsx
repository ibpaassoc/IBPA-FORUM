import Link from "next/link";
import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

const principles = [
  {
    title: "Global standard",
    text: "IBPA brings together licensed professionals, educators, salons, and beauty brands under one championship framework.",
  },
  {
    title: "Independent review",
    text: "Applications are assessed by the official jury panel using category-specific criteria and professional ethics standards.",
  },
  {
    title: "Prestige with structure",
    text: "From category awards to Grand Prix selection, every recognition is designed to feel earned, visible, and credible.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About IBPA"
        title="A beauty championship designed to honor modern excellence."
        description="IBPA Beauty Championship recognizes the professionals and organizations moving the industry forward across artistry, education, wellness, salon leadership, and brand innovation."
        aside={
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
              At A Glance
            </p>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Edition</p>
                <p className="mt-2 text-2xl font-semibold">2026 Season</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Scope</p>
                <p className="mt-2 text-2xl font-semibold">12 Categories</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Recognition</p>
                <p className="mt-2 text-2xl font-semibold">Category Awards + Grand Prix</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href="/categories"
            className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] hover:opacity-90"
          >
            Explore Categories
          </Link>
          <Link
            href="/apply"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            Start Application
          </Link>
        </div>
      </PageHero>

      <PageSection className="grid gap-4 md:grid-cols-3">
        {principles.map((item) => (
          <PageCard key={item.title}>
            <p className="page-eyebrow text-[10px]">{item.title}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{item.title}</p>
            <p className="page-copy mt-4 text-sm">{item.text}</p>
          </PageCard>
        ))}
      </PageSection>
    </PageShell>
  );
}

import Link from "next/link";
import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

const pillars = [
  {
    title: "Not a direct application",
    text: "The Grand Prix is chosen from category winners rather than through a separate public entry path.",
  },
  {
    title: "Only in strong championship years",
    text: "The full jury considers the Grand Prix only when at least five categories produce award recipients.",
  },
  {
    title: "Selected by the full jury",
    text: "This final distinction represents broad excellence, consistency, and cross-category prestige.",
  },
];

export default function GrandPrixPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Grand Prix"
        title="The championship's highest distinction is earned, not entered."
        description="Grand Prix protects the prestige of the overall competition by recognizing an exceptional winner only when the championship year demonstrates enough category depth and competitive strength."
        aside={
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Selection Snapshot
            </p>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Eligibility</p>
              <p className="mt-2 text-lg font-semibold">Category winners only</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Minimum depth</p>
              <p className="mt-2 text-2xl font-semibold">5+ active winning categories</p>
            </div>
          </div>
        }
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href="/categories"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            Review Categories
          </Link>
        </div>
      </PageHero>

      <PageSection className="grid gap-4 md:grid-cols-3">
        {pillars.map((item) => (
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

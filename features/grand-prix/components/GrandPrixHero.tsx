import Link from "next/link";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function GrandPrixHero() {
  return (
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
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Decision body</p>
            <p className="mt-2 text-lg font-semibold">Full jury panel</p>
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
  );
}

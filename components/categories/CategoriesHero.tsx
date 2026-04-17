import Link from "next/link";
import { PageHero } from "@/components/layout/PageShell";

export default function CategoriesHero() {
  return (
    <PageHero
      eyebrow="Award Categories"
      title="Twelve championship paths across today's beauty industry."
      description="Each category is built for a different discipline, from artistry and skin to salon leadership, education, and brand excellence. Applicants choose the category that best matches their work and submit a dedicated entry."
      aside={
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
            Entry Rules
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Fee</p>
            <p className="mt-2 text-2xl font-semibold">$50 per category</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Eligibility</p>
            <p className="mt-2 text-lg font-semibold">Trainer / Coach+ membership</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap gap-4">
        <Link
          href="/apply"
          className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] hover:opacity-90"
        >
          Apply In A Category
        </Link>
      </div>
    </PageHero>
  );
}

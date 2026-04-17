import Link from "next/link";
import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

export default function TestJuryPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Jury Test Route"
        title="Internal jury testing now shares the public site styling."
        description="This placeholder route keeps the same premium IBPA visual system while the team decides what development-only jury tooling belongs here."
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href="/jury"
            className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] hover:opacity-90"
          >
            Open Jury Page
          </Link>
          <Link
            href="/apply/jury"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            Open Jury Application
          </Link>
        </div>
      </PageHero>

      <PageSection className="flex justify-center">
        <PageCard className="max-w-3xl text-center">
          <p className="page-eyebrow text-[10px]">Development Note</p>
          <p className="mt-4 text-2xl font-semibold text-white">
            Ready for future jury-specific test utilities
          </p>
          <p className="page-copy mt-4 text-sm">
            When this route gains real tooling, it can reuse the same cards, hero
            layout, and accent system without falling back to a mismatched default page.
          </p>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}

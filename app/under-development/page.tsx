import Link from "next/link";
import {
  PageCard,
  PageHero,
  PageSection,
  PageShell,
} from "@/components/layout/PageShell";

const nextSteps = [
  "Application flow is being finalized for the next release.",
  "Category details and submission requirements are being verified.",
  "Portfolio upload and review steps are currently being polished.",
];

export default function UnderDevelopmentPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Applications Update"
        title="The competitor application experience is currently under development."
        description="We are preparing the final submission flow so the launch feels as polished as the rest of the championship site. The Apply Now route will open here until the full application experience is ready."
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href="/categories"
            className="rounded-full bg-[#d8c27a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
          >
            Explore Categories
          </Link>
          <Link
            href="/apply/jury"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            Apply as Jury
          </Link>
        </div>
      </PageHero>

      <PageSection className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <PageCard className="rounded-[1.75rem] p-7 md:p-8">
          <p className="page-eyebrow text-[10px]">What Is Happening</p>
          <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
            The public application flow is not live yet.
          </h2>
          <p className="page-copy mt-5 text-sm">
            We are still refining the submission journey for competitors, so this
            page acts as a clear holding screen instead of sending visitors into
            a partially finished experience.
          </p>
        </PageCard>

        <PageCard className="rounded-[1.75rem] p-7 md:p-8">
          <p className="page-eyebrow text-[10px]">Current Status</p>
          <div className="mt-5 space-y-3">
            {nextSteps.map((step) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d9d4ca]"
              >
                {step}
              </div>
            ))}
          </div>
        </PageCard>
      </PageSection>
    </PageShell>
  );
}

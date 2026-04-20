import type { Metadata } from "next";
import ApplyForm from "@/components/apply/ApplyForm";
import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";
import { applicationTimeline } from "@/lib/apply/catalog";
import { getApplicationCategories } from "@/lib/apply/server";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Championship",
  description:
    "Submit your official participant application for the IBPA Beauty Championship.",
};

const heroStats = [
  {
    label: "Entry Fee",
    value: applicationTimeline.feeLabel,
  },
  {
    label: "Deadline",
    value: applicationTimeline.deadlineLabel,
  },
  {
    label: "Judging",
    value: applicationTimeline.judgingLabel,
  },
  {
    label: "Ceremony",
    value: applicationTimeline.ceremonyLabel,
  },
];

export default async function ApplyPage() {
  const categories = await getApplicationCategories();

  return (
    <PageShell>
      <PageHero
        eyebrow="Participant Applications"
        title="Apply for the IBPA Beauty Championship"
        description="Submit your official participant entry with category-specific supporting materials, verified membership, and production-ready files for the championship review team."
        aside={
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              2026 Timeline
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {item.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="flex flex-wrap gap-3">
          {heroStats.map((item) => (
            <div
              key={item.label}
              className="rounded-full border border-[#d8c27a]/22 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#efe6d0]"
            >
              {item.label}: {item.value}
            </div>
          ))}
        </div>
      </PageHero>

      <PageSection className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <PageCard className="rounded-[1.8rem] p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Eligibility & Important Notes
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[#d9d4ca]">
              <p>
                Participation fee: <strong>$50 per category</strong>.
              </p>
              <p>Each category is submitted as a separate application.</p>
              <p>
                Minimum membership required:{" "}
                <strong>{applicationTimeline.membershipMinimum}</strong>.
              </p>
              <p>
                Applicants below the required membership level will be blocked from
                submitting until they upgrade.
              </p>
              <p>Jury fee rules do not apply to this participant application page.</p>
            </div>
          </PageCard>

          <PageCard className="rounded-[1.8rem] p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              Before You Start
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "Prepare your license or certification file.",
                "Choose one category and one specific award.",
                "Gather all portfolio and supporting files for Block B.",
                "Have a valid Trainer / Coach membership number ready.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-[#efe6d0]"
                >
                  {item}
                </div>
              ))}
            </div>
          </PageCard>
        </div>

        <ApplyForm categories={categories} />
      </PageSection>
    </PageShell>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import { PageSection, PageShell } from "@/shared/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Championship",
  description:
    "Submit your official participant application for the IBPA Beauty Championship.",
};

export default function ApplyPage() {
  return (
    <PageShell>
      <PageSection className="pt-28 pb-8">
        <div className="mx-auto mb-8 max-w-3xl rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,194,122,0.14),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-7 backdrop-blur-sm sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Candidate Application
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-[2.25rem]">
            Submit your championship entry.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca] sm:text-base">
            Complete the form below with your professional details and category materials.
          </p>
        </div>
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader />
        </Suspense>
      </PageSection>
    </PageShell>
  );
}

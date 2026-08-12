import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ApplicationFormLoader from "@/features/applications/components/application-form/ApplicationFormLoader";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import { isValidApplicationAccessToken } from "@/lib/apply/access";
import { LandingPageShell, PageSection } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Apply | IBPA Beauty Award",
  description:
    "Submit your official participant application for the IBPA Beauty Award.",
  robots: {
    index: false,
    follow: false,
  },
};

// The application form loads categories/nominations live from the DB, so this
// page must render dynamically — otherwise a build-time snapshot would hide
// newly added Award rows in production.
export const dynamic = "force-dynamic";

type ApplyPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const { token } = await searchParams;
  const accessToken = token ?? "";

  if (!isValidApplicationAccessToken(accessToken)) {
    notFound();
  }

  return (
    <LandingPageShell>
      <PageSection id="apply-form" className="landing-section pb-16 pt-10 sm:pt-12">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <ApplicationFormLoader accessToken={accessToken} />
        </Suspense>
      </PageSection>
    </LandingPageShell>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ApplicationFormSkeleton from "@/features/applications/components/application-form/ApplicationFormSkeleton";
import JuryApplyHero from "@/features/jury/components/jury-application/JuryApplyHero";
import JuryApplicationFormLoader from "@/features/jury/components/jury-application/JuryApplicationFormLoader";
import { isValidJuryApplyAccessToken } from "@/lib/jury/apply-access";
import { LandingPageShell, PageSection } from "@/shared/components/public";

export const metadata: Metadata = {
  title: "Jury Application | IBPA Beauty Award",
  description: "Submit your invited jury application for the IBPA Beauty Award.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type JuryApplyPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function JuryApplyPage({ searchParams }: JuryApplyPageProps) {
  const { token } = await searchParams;
  const accessToken = token ?? "";

  if (!isValidJuryApplyAccessToken(accessToken)) {
    notFound();
  }

  return (
    <LandingPageShell>
      <JuryApplyHero />
      <PageSection id="jury-apply-form" className="landing-section pb-16 pt-10 sm:pt-12">
        <Suspense fallback={<ApplicationFormSkeleton />}>
          <JuryApplicationFormLoader accessToken={accessToken} />
        </Suspense>
      </PageSection>
    </LandingPageShell>
  );
}

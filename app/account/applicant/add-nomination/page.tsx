import { ArrowLeft } from "lucide-react";
import AddNominationsForm from "@/features/account/components/AddNominationsForm";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { prisma } from "@/shared/lib/prisma";
import {
  DashboardPageHeader,
  DashboardPanel,
  DashboardShell,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

export default async function AddNominationPage() {
  const { applicantProfile } = await requireApplicantAccount();
  const [categories, ownedNominations] = await Promise.all([
    getApplicationCategories(),
    prisma.nominationApplication.findMany({
      where: {
        applicantProfileId: applicantProfile.id,
        deletedAt: null,
      },
      select: { awardId: true },
    }),
  ]);

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-3 pb-24 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <SecondaryButton href="/account/applicant">
          <ArrowLeft size={16} /> Back to dashboard
        </SecondaryButton>
        <DashboardPageHeader label="Applicant account" title="Add nominations" />
        <DashboardPanel>
          <AddNominationsForm
            categories={categories}
            ownedAwardIds={ownedNominations.map((item) => item.awardId)}
            isVerifiedMember={Boolean(applicantProfile.membershipNumber && applicantProfile.membershipLevel)}
          />
        </DashboardPanel>
      </main>
    </DashboardShell>
  );
}

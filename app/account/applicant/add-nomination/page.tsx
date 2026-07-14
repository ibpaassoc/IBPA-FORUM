import { ArrowLeft } from "lucide-react";
import AddNominationsForm from "@/features/account/components/AddNominationsForm";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { prisma } from "@/shared/lib/prisma";
import {
  DashboardPageHeader,
  DashboardPanel,
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
    <div className="flex flex-col gap-5">
      <div>
        <SecondaryButton href="/account/applicant">
          <ArrowLeft size={16} /> Back to dashboard
        </SecondaryButton>
      </div>
      <DashboardPageHeader label="Applicant account" title="Add nominations" />
      <DashboardPanel>
        <AddNominationsForm
          categories={categories}
          ownedAwardIds={ownedNominations.map((item) => item.awardId)}
          isVerifiedMember={Boolean(applicantProfile.membershipNumber && applicantProfile.membershipLevel)}
        />
      </DashboardPanel>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import AddNominationFlow from "@/features/account/components/add-nomination/AddNominationFlow";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { getServerTranslations } from "@/lib/i18n/server";
import { prisma } from "@/shared/lib/prisma";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import {
  DashboardPageHeader,
  SecondaryButton,
} from "@/shared/components/admin/DashboardUI";

export default async function AddNominationPage() {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });
  const [categories, ownedNominations, t] = await Promise.all([
    getApplicationCategories(),
    prisma.nominationApplication.findMany({
      where: {
        applicantProfileId: applicantProfile.id,
        deletedAt: null,
      },
      select: { awardId: true },
    }),
    getServerTranslations(),
  ]);
  const flow = t.account.addFlow;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SecondaryButton href="/account/applicant/nominations">
          <ArrowLeft size={16} /> {flow.backToNominations}
        </SecondaryButton>
      </div>
      <DashboardPageHeader label={flow.label} title={flow.title} description={flow.description} />
      <AddNominationFlow
        categories={categories}
        ownedAwardIds={ownedNominations.map((item) => item.awardId)}
        isVerifiedMember={Boolean(applicantProfile.membershipNumber && applicantProfile.membershipLevel)}
      />
    </div>
  );
}

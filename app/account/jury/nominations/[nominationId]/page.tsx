import JuryApplicationDetailPage from "@/features/jury/components/dashboard/JuryApplicationDetailPage";
import { getAuthenticatedJudgeScoringContext } from "@/features/admin/server/jury";
import { getJuryDashboardApplicationDetail } from "@/features/jury/server/dashboard-queries";

export default async function AccountJuryNominationPage({
  params,
}: {
  params: Promise<{ nominationId: string }>;
}) {
  const judge = await getAuthenticatedJudgeScoringContext();
  const { nominationId } = await params;
  const data = await getJuryDashboardApplicationDetail({
    judge,
    nominationApplicationId: nominationId,
  });

  return (
    <div className="mx-auto w-full max-w-[1520px] px-3 pb-28 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
      <JuryApplicationDetailPage
        nomination={data.nomination}
        categoryFields={data.categoryFields}
        score={data.score}
      />
    </div>
  );
}

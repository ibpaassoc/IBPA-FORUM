import JuryApplicationDetailPage from "@/features/jury/components/dashboard/JuryApplicationDetailPage";
import { getAuthenticatedJudgeScoringContext } from "@/features/admin/server/jury";
import { getJuryDashboardApplicationDetail } from "@/features/jury/server/dashboard-queries";

export default async function JuryDashboardApplicationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const judge = await getAuthenticatedJudgeScoringContext();
  const { id: nominationApplicationId } = await params;
  const data = await getJuryDashboardApplicationDetail({
    judge,
    nominationApplicationId,
  });

  return (
    <JuryApplicationDetailPage
      nomination={data.nomination}
      categoryFields={data.categoryFields}
      score={data.score}
    />
  );
}

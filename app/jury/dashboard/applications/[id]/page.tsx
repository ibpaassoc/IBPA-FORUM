import JuryApplicationDetailPage from "@/features/jury/components/dashboard/JuryApplicationDetailPage";
import { getAuthenticatedJudgeScoringContext } from "@/features/scoring/server/jury";
import { getJuryDashboardApplicationDetail } from "@/features/jury/server/dashboard-queries";

export default async function JuryDashboardApplicationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const judge = await getAuthenticatedJudgeScoringContext();
  const { id } = await params;
  const data = await getJuryDashboardApplicationDetail({
    judge,
    applicationId: id,
  });

  return (
    <JuryApplicationDetailPage
      application={data.application}
      categoryFields={data.categoryFields}
      score={data.score}
    />
  );
}

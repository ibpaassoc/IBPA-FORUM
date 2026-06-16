import { getAuthenticatedJudgeScoringContext } from "@/features/admin/server/jury";
import { getJuryDashboardData } from "@/features/jury/server/dashboard-queries";
import JuryScoresPage from "@/features/jury/components/dashboard/JuryScoresPage";

export default async function JurySubmittedScoresRoute() {
  const judge = await getAuthenticatedJudgeScoringContext();
  const data = await getJuryDashboardData({ judge });

  const submitted = data.applications.filter((a) => a.scoreStatus === "SUBMITTED");

  return (
    <JuryScoresPage
      applications={submitted}
      juryName={data.judge.fullName}
    />
  );
}

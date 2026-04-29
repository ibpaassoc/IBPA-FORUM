import JuryDashboardPage from "@/features/jury/components/dashboard/JuryDashboardPage";
import { getAuthenticatedJudgeScoringContext } from "@/features/scoring/server/jury";
import { getJuryDashboardData } from "@/features/jury/server/dashboard-queries";

export default async function JuryDashboardRoute({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const judge = await getAuthenticatedJudgeScoringContext();
  const { category } = await searchParams;
  const data = await getJuryDashboardData({
    judge,
    category,
  });

  return (
    <JuryDashboardPage
      juryName={data.judge.fullName}
      professionalTitle={data.judge.professionalTitle}
      expertiseAreas={data.judge.expertiseAreas}
      applications={data.applications}
      activeCategory={data.activeCategory}
      totals={data.totals}
    />
  );
}

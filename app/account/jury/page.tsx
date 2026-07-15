import JuryDashboardPage from "@/features/jury/components/dashboard/JuryDashboardPage";
import { getAuthenticatedJudgeScoringContext } from "@/features/admin/server/jury";
import { getJuryDashboardData } from "@/features/jury/server/dashboard-queries";

export default async function AccountJuryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; direction?: string }>;
}) {
  const judge = await getAuthenticatedJudgeScoringContext();
  const { category, direction } = await searchParams;
  const data = await getJuryDashboardData({
    judge,
    category: category ?? direction,
  });

  return (
    <div className="mx-auto w-full max-w-[1520px] px-3 pb-28 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
      <JuryDashboardPage
        juryName={data.judge.fullName}
        professionalTitle={data.judge.professionalTitle}
        expertiseAreas={data.judge.expertiseAreas}
        applications={data.applications}
        activeCategory={data.activeCategory}
        totals={data.totals}
      />
    </div>
  );
}

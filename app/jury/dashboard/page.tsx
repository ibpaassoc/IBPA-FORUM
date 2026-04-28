import JuryDashboardPage from "@/features/jury/components/dashboard/JuryDashboardPage";
import { requireJuryAuth } from "@/features/jury/server/auth";
import { getJuryDashboardData } from "@/features/jury/server/dashboard-queries";

export default async function JuryDashboardRoute({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const juryUser = await requireJuryAuth();
  const { category } = await searchParams;
  const data = await getJuryDashboardData({
    juryApplicationId: juryUser.juryApplicationId,
    expertiseAreas: juryUser.expertiseAreas,
    category,
  });

  return (
    <JuryDashboardPage
      juryName={data.juryApplication.fullName}
      professionalTitle={data.juryApplication.professionalTitle}
      expertiseAreas={data.juryApplication.expertiseAreas}
      applications={data.applications}
      activeCategory={data.activeCategory}
      totals={data.totals}
    />
  );
}

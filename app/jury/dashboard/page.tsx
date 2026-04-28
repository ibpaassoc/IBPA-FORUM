import JuryDashboardPage from "@/features/jury/components/dashboard/JuryDashboardPage";
import { requireJuryAuth } from "@/features/jury/server/auth";
import { getJuryDashboardData } from "@/features/jury/server/dashboard-queries";

export default async function JuryDashboardRoute({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const juryUser = await requireJuryAuth();
  const { status } = await searchParams;
  const data = await getJuryDashboardData({
    juryApplicationId: juryUser.juryApplicationId,
    expertiseAreas: juryUser.expertiseAreas,
    status,
  });

  return (
    <JuryDashboardPage
      juryName={data.juryApplication.fullName}
      professionalTitle={data.juryApplication.professionalTitle}
      expertiseAreas={data.juryApplication.expertiseAreas}
      applications={data.applications}
      activeStatus={data.activeStatus}
      totals={data.totals}
    />
  );
}

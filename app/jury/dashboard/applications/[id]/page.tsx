import JuryApplicationDetailPage from "@/features/jury/components/dashboard/JuryApplicationDetailPage";
import { requireJuryAuth } from "@/features/jury/server/auth";
import { getJuryDashboardApplicationDetail } from "@/features/jury/server/dashboard-queries";

export default async function JuryDashboardApplicationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const juryUser = await requireJuryAuth();
  const { id } = await params;
  const data = await getJuryDashboardApplicationDetail({
    applicationId: id,
    expertiseAreas: juryUser.expertiseAreas,
  });

  return (
    <JuryApplicationDetailPage
      application={data.application}
      categoryFields={data.categoryFields}
    />
  );
}

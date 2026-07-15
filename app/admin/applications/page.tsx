import ApplicationListPage from "@/features/admin/components/participant-applications/ApplicationListPage";
import { getParticipantApplications } from "@/features/admin/server/participant-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireAdmin();

  const { error, notice } = await searchParams;
  const { applications, totals } = await getParticipantApplications();

  return (
    <ApplicationListPage
      applications={applications}
      totals={totals}
      error={error}
      notice={notice}
    />
  );
}

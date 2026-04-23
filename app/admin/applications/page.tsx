import ApplicationListPage from "@/features/admin/components/participant-applications/ApplicationListPage";
import { getParticipantApplications } from "@/features/admin/server/participant-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const data = await getParticipantApplications(status);

  return <ApplicationListPage {...data} />;
}

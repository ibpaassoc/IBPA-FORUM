import JuryApplicationListPage from "@/features/admin/components/jury-applications/JuryApplicationListPage";
import { getJuryApplications } from "@/features/admin/server/jury-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminJuryApplicationsPage() {
  await requireAdmin();

  const data = await getJuryApplications();
  return <JuryApplicationListPage {...data} />;
}

import RegulationsManagementPage from "@/features/admin/components/regulations/RegulationsManagementPage";
import { getRegulationsForAdmin } from "@/features/regulations/server/queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminRegulationsPage() {
  await requireAdmin();
  const regulations = await getRegulationsForAdmin();

  return <RegulationsManagementPage {...regulations} />;
}

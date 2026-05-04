import AdminScoringOverviewPage from "@/features/scoring/components/admin/AdminScoringOverviewPage";
import { getAdminScoringOverview } from "@/features/scoring/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminScoringPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    status?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  await requireAdmin();

  const { category, status, q, sort } = await searchParams;
  const data = await getAdminScoringOverview({
    category,
    status,
    q,
    sort,
  });

  return <AdminScoringOverviewPage {...data} />;
}

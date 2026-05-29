import AdminScoringOverviewPage from "@/features/admin/components/scoring/AdminScoringOverviewPage";
import { getAdminScoringOverview } from "@/features/admin/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminScoringPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    direction?: string;
    status?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  await requireAdmin();

  const { category, direction, status, q, sort } = await searchParams;
  const data = await getAdminScoringOverview({
    category: category ?? direction,
    status,
    q,
    sort,
  });

  return <AdminScoringOverviewPage {...data} />;
}

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
    minScore?: string;
    maxScore?: string;
    progress?: string;
    page?: string;
    perPage?: string;
  }>;
}) {
  await requireAdmin();

  const {
    category,
    direction,
    status,
    q,
    sort,
    minScore,
    maxScore,
    progress,
    page,
    perPage,
  } = await searchParams;
  const data = await getAdminScoringOverview({
    category: category ?? direction,
    status,
    q,
    sort,
    minScore,
    maxScore,
    progress,
    page,
    perPage,
  });

  return <AdminScoringOverviewPage {...data} />;
}

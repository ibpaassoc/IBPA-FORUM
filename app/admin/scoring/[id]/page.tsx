import { notFound } from "next/navigation";
import AdminScoringDetailPage from "@/features/admin/components/scoring/AdminScoringDetailPage";
import { getAdminApplicationScoringDetail } from "@/features/admin/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminScoringDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const detail = await getAdminApplicationScoringDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <AdminScoringDetailPage
      application={detail.application}
      summary={detail.summary}
      scoringDefinition={detail.scoringDefinition}
      judgeRows={detail.judgeRows}
    />
  );
}

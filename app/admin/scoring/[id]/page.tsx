import { notFound } from "next/navigation";
import AdminScoringDetailPage from "@/features/scoring/components/admin/AdminScoringDetailPage";
import { getAdminApplicationScoringDetail } from "@/features/scoring/server/admin";
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
      judgeRows={detail.judgeRows}
    />
  );
}

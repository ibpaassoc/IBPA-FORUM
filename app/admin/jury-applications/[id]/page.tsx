import { notFound } from "next/navigation";
import JuryApplicationDetailPage from "@/features/admin/components/jury-applications/JuryApplicationDetailPage";
import { getJuryApplicationDetail } from "@/features/admin/server/jury-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminJuryApplicationDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error, notice } = await searchParams;

  if (!id) {
    notFound();
  }

  const application = await getJuryApplicationDetail(id);

  if (!application) {
    notFound();
  }

  return (
    <JuryApplicationDetailPage
      application={application}
      error={error}
      notice={notice}
    />
  );
}

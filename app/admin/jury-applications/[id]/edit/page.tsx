import { notFound } from "next/navigation";
import JuryApplicationEditPage from "@/features/admin/components/jury-applications/JuryApplicationEditPage";
import { getJuryApplicationDetail } from "@/features/admin/server/jury-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminJuryApplicationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  if (!id) {
    notFound();
  }

  const application = await getJuryApplicationDetail(id);

  if (!application) {
    notFound();
  }

  return <JuryApplicationEditPage application={application} />;
}

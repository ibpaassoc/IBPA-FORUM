import { notFound } from "next/navigation";
import ApplicantAdminDetailPage from "@/features/admin/components/participant-applications/ApplicantAdminDetailPage";
import { getParticipantApplicationDetail } from "@/features/admin/server/participant-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminApplicationDetailPage({
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

  const application = await getParticipantApplicationDetail(id);

  if (!application) {
    notFound();
  }

  return <ApplicantAdminDetailPage data={application} error={error} notice={notice} />;
}

import { notFound } from "next/navigation";
import ApplicationEditPage from "@/features/admin/components/participant-applications/ApplicationEditPage";
import { getParticipantApplicationDetail } from "@/features/admin/server/participant-queries";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminApplicationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  if (!id) {
    notFound();
  }

  const application = await getParticipantApplicationDetail(id);

  if (!application) {
    notFound();
  }

  return <ApplicationEditPage application={application} />;
}

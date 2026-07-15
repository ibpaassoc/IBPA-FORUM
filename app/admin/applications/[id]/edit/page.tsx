import { redirect } from "next/navigation";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminApplicationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  redirect(`/admin/applications/${id}`);
}

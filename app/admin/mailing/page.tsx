import AdminMailingPage from "@/features/admin/components/mailing/AdminMailingPage";
import { getMailingRecipients } from "@/features/admin/server/mailing";
import { requireAdmin } from "@/shared/lib/admin-auth";

export const maxDuration = 300;

export default async function MailingPage() {
  await requireAdmin();
  const { applicants, jury } = await getMailingRecipients();

  return <AdminMailingPage applicants={applicants} jury={jury} />;
}

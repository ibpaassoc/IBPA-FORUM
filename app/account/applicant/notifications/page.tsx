import NotificationsPage from "@/features/notifications/components/NotificationsPage";
import { getNotificationsForAccount } from "@/features/notifications/server/notifications";
import { requireApplicantAccount } from "@/features/account/server/accounts";

export default async function ApplicantNotificationsPage() {
  const { account } = await requireApplicantAccount();
  const notifications = await getNotificationsForAccount(account.id);
  return <NotificationsPage notifications={notifications} />;
}

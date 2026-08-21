import NotificationsPage from "@/features/notifications/components/NotificationsPage";
import { getNotificationsForAccount } from "@/features/notifications/server/notifications";
import { requireJuryAccount } from "@/features/account/server/accounts";

export default async function JuryNotificationsPage() {
  const { account } = await requireJuryAccount();
  const notifications = await getNotificationsForAccount(account.id);
  return <NotificationsPage notifications={notifications} />;
}

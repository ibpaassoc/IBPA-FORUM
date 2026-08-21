import AdminNotificationsPage from "@/features/admin/components/notifications/AdminNotificationsPage";
import { getNotificationAdminData } from "@/features/notifications/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function NotificationsAdminPage() {
  await requireAdmin();
  const data = await getNotificationAdminData();
  return <AdminNotificationsPage {...data} />;
}

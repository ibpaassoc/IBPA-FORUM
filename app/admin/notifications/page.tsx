import AdminNotificationsPage from "@/features/admin/components/notifications/AdminNotificationsPage";
import { getNotificationAdminData } from "@/features/notifications/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Уведомления аккаунтов | IBPA Admin",
};

export default async function NotificationsAdminPage() {
  await requireAdmin();
  const data = await getNotificationAdminData();
  return <AdminNotificationsPage {...data} />;
}

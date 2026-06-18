import { requireAdmin } from "@/shared/lib/admin-auth";
import { getAllTickets } from "@/features/tickets/server/ticket-repository";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import TicketsPage from "@/features/admin/components/tickets/TicketsPage";

export default async function AdminTicketsPage() {
  await requireAdmin();
  const [tickets, earlyBirdEnabled] = await Promise.all([
    getAllTickets(),
    getSiteSettingBool("earlyBirdEnabled"),
  ]);
  return <TicketsPage tickets={tickets} initialEarlyBirdEnabled={earlyBirdEnabled} />;
}

import { requireAdmin } from "@/shared/lib/admin-auth";
import { getAllTickets } from "@/features/tickets/server/ticket-repository";
import TicketsPage from "@/features/admin/components/tickets/TicketsPage";
import { isSpecialPacketEnabled } from "@/features/tickets/server/special-packet";

export default async function AdminTicketsPage() {
  await requireAdmin();
  const [tickets, specialPacketEnabled] = await Promise.all([
    getAllTickets(),
    isSpecialPacketEnabled(),
  ]);
  return <TicketsPage tickets={tickets} specialPacketEnabled={specialPacketEnabled} />;
}

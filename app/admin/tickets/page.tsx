import { requireAdmin } from "@/shared/lib/admin-auth";
import { getAllTickets } from "@/features/tickets/server/ticket-repository";
import TicketsPage from "@/features/admin/components/tickets/TicketsPage";

export default async function AdminTicketsPage() {
  await requireAdmin();
  const tickets = await getAllTickets();
  return <TicketsPage tickets={tickets} />;
}

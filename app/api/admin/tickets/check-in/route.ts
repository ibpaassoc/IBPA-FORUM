import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findTicketByToken, checkInTicket } from "@/features/tickets/server/ticket-repository";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { syncCheckInOnChange } from "@/features/google-sheets";
import { adminT } from "@/lib/i18n/admin";

const checkInSchema = z.object({
  token: z.string().min(16, adminT.api.invalidToken),
  checkInType: z.enum(["ONE_DAY", "GALA_DINNER"] as const),
});

/**
 * POST /api/admin/tickets/check-in
 *
 * Marks a ticket as checked-in after QR scan verification.
 *
 * Body: { token: string, checkInType: "ONE_DAY" | "GALA_DINNER" }
 *
 * Future scanner workflow:
 *   1. Admin scans QR code → app decodes "IBPA-TICKET:{secureToken}"
 *   2. App calls GET /api/admin/tickets/{token} to preview ticket info
 *   3. Admin confirms → app calls POST /api/admin/tickets/check-in
 *   4. Status updated and lastCheckIn timestamp recorded
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: adminT.api.unauthorized }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: adminT.api.invalidJson }, { status: 400 });
  }

  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: adminT.api.invalidRequest }, { status: 400 });
  }

  const { token, checkInType } = parsed.data;
  const ticket = await findTicketByToken(token);

  if (!ticket) {
    return NextResponse.json({ message: adminT.api.ticketNotFound }, { status: 404 });
  }

  if (ticket.status === "PENDING" || ticket.status === "CANCELED") {
    return NextResponse.json(
      { message: adminT.api.unpaidTicket },
      { status: 422 }
    );
  }

  const nextStatus =
    checkInType === "GALA_DINNER" ? "CHECKED_GALA_DINNER" : "CHECKED_ONE_DAY";

  const updated = await checkInTicket(ticket.id, nextStatus);

  syncCheckInOnChange({ kind: "TICKET", id: updated.id });

  return NextResponse.json({
    ticket: {
      id: updated.id,
      fullName: updated.fullName,
      status: updated.status,
      lastCheckIn: updated.lastCheckIn,
    },
  });
}

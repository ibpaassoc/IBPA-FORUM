import { NextRequest, NextResponse } from "next/server";
import { findTicketByToken } from "@/features/tickets/server/ticket-repository";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/**
 * GET /api/admin/tickets/:token
 *
 * Looks up a ticket by its secure token (decoded from a scanned QR code).
 * The QR code encodes "IBPA-TICKET:{secureToken}" — the caller strips the
 * prefix before calling this endpoint.
 *
 * Future scanner flow:
 *   1. Scan QR → extract secureToken
 *   2. GET /api/admin/tickets/{secureToken} → receive ticket details
 *   3. Admin reviews → POST /api/admin/tickets/check-in to confirm
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { token } = await params;

  if (!token || token.length < 16) {
    return NextResponse.json({ message: "Invalid token." }, { status: 400 });
  }

  const ticket = await findTicketByToken(token);

  if (!ticket) {
    return NextResponse.json({ message: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      fullName: ticket.fullName,
      email: ticket.email,
      phone: ticket.phone,
      type: ticket.type,
      galaDinner: ticket.galaDinner,
      isIbpaMember: ticket.isIbpaMember,
      status: ticket.status,
      lastCheckIn: ticket.lastCheckIn,
      createdAt: ticket.createdAt,
    },
  });
}

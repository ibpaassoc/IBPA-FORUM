import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { resendTicketPaymentLink } from "@/features/tickets/server/ticket-resend";

/**
 * POST /api/admin/tickets/payment-link  { ticketId }
 *
 * Admin-only: generate and email a fresh Stripe payment link for an unpaid
 * ticket. Authorization and the "not already paid" rule are both enforced here
 * on the server, independent of whatever the UI shows.
 *
 * Lives as a static sibling of `[token]/` (like `check-in/`) so the two dynamic
 * segments don't collide.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { ticketId?: unknown };
  const ticketId = typeof body.ticketId === "string" ? body.ticketId.trim() : "";

  if (!ticketId) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 400 });
  }

  try {
    // Customer locale isn't stored with the ticket; the ticket emails are English.
    const result = await resendTicketPaymentLink(ticketId, "en");

    if (result.ok) {
      return NextResponse.json({ ok: true, reused: result.reused }, { status: 200 });
    }

    const status =
      result.reason === "not_found"
        ? 404
        : result.reason === "already_paid"
          ? 409
          : 502; // email_failed

    return NextResponse.json({ ok: false, reason: result.reason }, { status });
  } catch (error) {
    console.error("POST /api/admin/tickets/payment-link error:", error);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

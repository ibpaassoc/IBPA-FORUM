import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { resendTicketPaymentLink } from "@/features/tickets/server/ticket-resend";

/**
 * POST /api/admin/tickets/:id/payment-link
 *
 * Admin-only: generate and email a fresh Stripe payment link for an unpaid
 * ticket. Authorization and the "not already paid" rule are both enforced here
 * on the server, independent of whatever the UI shows.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 400 });
  }

  try {
    // Customer locale isn't stored with the ticket; the ticket emails are English.
    const result = await resendTicketPaymentLink(id, "en");

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
    console.error("POST /api/admin/tickets/[id]/payment-link error:", error);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

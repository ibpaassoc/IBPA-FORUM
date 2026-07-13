import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import {
  getTicketQrPreview,
  regenerateAndSendTicketQr,
  regenerateTicketQr,
  sendCurrentTicketQr,
} from "@/features/tickets/server/ticket-admin-service";

type QrAction = "preview" | "generate" | "regenerate_resend" | "resend_current";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    ticketId?: unknown;
    action?: unknown;
  };
  const ticketId = typeof body.ticketId === "string" ? body.ticketId.trim() : "";
  const action = body.action as QrAction;

  if (!ticketId) {
    return NextResponse.json({ ok: false, message: "Ticket ID is required." }, { status: 400 });
  }

  if (action === "preview") {
    const result = await getTicketQrPreview(ticketId);
    if (!result.ok) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  }

  if (action === "generate") {
    const result = await regenerateTicketQr(ticketId);
    if (!result.ok) {
      return NextResponse.json(result, {
        status: result.reason === "not_found" ? 404 : 422,
      });
    }
    const preview = await getTicketQrPreview(ticketId);
    return NextResponse.json(preview);
  }

  if (action === "regenerate_resend") {
    const result = await regenerateAndSendTicketQr(ticketId);
    if (!result.ok) {
      return NextResponse.json(result, {
        status:
          result.reason === "not_found" ? 404 : result.reason === "not_eligible" ? 422 : 207,
      });
    }
    return NextResponse.json(result);
  }

  if (action === "resend_current") {
    const result = await sendCurrentTicketQr(ticketId);
    if (!result.ok) {
      return NextResponse.json(result, {
        status:
          result.reason === "not_found" ? 404 : result.reason === "not_eligible" ? 422 : 207,
      });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, message: "Unsupported QR action." }, { status: 400 });
}


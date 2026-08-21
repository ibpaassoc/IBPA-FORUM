import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import {
  deleteUnpaidAdminTicket,
  updateAdminTicket,
} from "@/features/tickets/server/ticket-admin-service";
import { adminT } from "@/lib/i18n/admin";

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: adminT.api.unauthorized }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    ticket?: unknown;
    sendUpdatedQr?: unknown;
  };

  const result = await updateAdminTicket(body.ticket, {
    sendUpdatedQr: body.sendUpdatedQr === true,
  });

  if (!result.ok) {
    const status =
      result.reason === "not_found" ? 404 : result.reason === "stale" ? 409 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: adminT.api.unauthorized }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { ticketId?: unknown };
  const ticketId = typeof body.ticketId === "string" ? body.ticketId.trim() : "";
  if (!ticketId) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const result = await deleteUnpaidAdminTicket(ticketId);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.reason === "not_found" ? 404 : 409 });
  }

  return NextResponse.json(result);
}

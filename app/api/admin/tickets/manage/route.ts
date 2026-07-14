import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { updateAdminTicket } from "@/features/tickets/server/ticket-admin-service";
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

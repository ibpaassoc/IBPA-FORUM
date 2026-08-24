import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { createAndSendAdminManualTicket } from "@/features/tickets/server/ticket-admin-service";
import { adminT } from "@/lib/i18n/admin";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { ok: false, message: adminT.api.unauthorized },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { ticket?: unknown };

  try {
    const result = await createAndSendAdminManualTicket(body.ticket);
    if (!result.ok) {
      return NextResponse.json(result, {
        status: result.reason === "invalid" ? 400 : 502,
      });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/tickets/manual error:", error);
    return NextResponse.json(
      { ok: false, reason: "error", message: adminT.tickets.manual.requestFailed },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { resendAllExistingTickets } from "@/features/tickets/server/ticket-bulk-resend";
import { adminT } from "@/lib/i18n/admin";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export const maxDuration = 300;

const requestSchema = z.object({
  runId: z.uuid(),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: adminT.api.unauthorized }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: adminT.api.invalidRequest },
      { status: 400 },
    );
  }

  try {
    const result = await resendAllExistingTickets(parsed.data.runId);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Bulk ticket resend failed.", { runId: parsed.data.runId, error });
    return NextResponse.json(
      { ok: false, message: adminT.tickets.bulkResend.requestFailed },
      { status: 500 },
    );
  }
}

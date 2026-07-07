import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { performCheckIn } from "@/features/check-in/server/check-in-service";
import { SCAN_MODES } from "@/features/check-in/types";

const checkInSchema = z.object({
  ticketKind: z.enum(["TICKET", "PARTICIPANT", "JURY"]),
  sourceRecordId: z.string().min(1).max(128),
  scope: z.enum(["FORUM", "GALA", "ATTENDANCE"]),
  mode: z.enum(SCAN_MODES).optional(),
});

/**
 * POST /api/admin/check-in
 *
 * Unified check-in. Marks attendance on the correct source table based on the
 * resolved ticket kind. Forum tickets support two independent scopes (FORUM and
 * GALA); participant and jury records use ATTENDANCE.
 *
 * Returns 409 with `code: "ALREADY_CHECKED_IN"` when the scope was already used,
 * so the client can show a clear "Already checked in" state.
 *
 * Admin-only. Body: { ticketKind, sourceRecordId, scope }
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid check-in request." }, { status: 400 });
  }

  const result = await performCheckIn(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.message,
        code: result.code,
        ...(result.code === "ALREADY_CHECKED_IN" ? { checkedInAt: result.checkedInAt } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ ticket: result.ticket });
}

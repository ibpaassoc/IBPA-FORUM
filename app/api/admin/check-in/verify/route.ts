import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { resolveScan } from "@/features/check-in/server/check-in-service";
import { SCAN_MODES } from "@/features/check-in/types";
import { adminT } from "@/lib/i18n/admin";

const verifySchema = z.object({
  code: z.string().min(1).max(256),
  mode: z.enum(SCAN_MODES).optional(),
});

/**
 * POST /api/admin/check-in/verify
 *
 * Unified ticket verification. Accepts a raw scanned QR string and resolves it
 * across every ticket-like record (forum/gala tickets, participant
 * applications, jury applications). Returns a normalized, privacy-safe view —
 * never the raw source row.
 *
 * Admin-only. Body: { code: string }
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

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: adminT.api.scannedCodeRequired }, { status: 400 });
  }

  const result = await resolveScan(parsed.data.code, parsed.data.mode);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({ ticket: result.ticket });
}

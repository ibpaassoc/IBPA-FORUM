import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { resolveScan } from "@/features/check-in/server/check-in-service";

const verifySchema = z.object({
  code: z.string().min(1).max(256),
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
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "A scanned code is required." }, { status: 400 });
  }

  const result = await resolveScan(parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ticket: result.ticket });
}

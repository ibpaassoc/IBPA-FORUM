import { NextRequest, NextResponse } from "next/server";
import { verifyIbpaMembership } from "@/features/tickets/server/ibpa-membership";

export async function GET(request: NextRequest) {
  const certNumber = request.nextUrl.searchParams.get("certNumber");

  if (!certNumber || !certNumber.trim()) {
    return NextResponse.json({ error: "certNumber is required" }, { status: 400 });
  }

  const result = await verifyIbpaMembership(certNumber);

  if (result.verified) {
    return NextResponse.json({ valid: true });
  }

  if (result.reason === "ibpa_api_not_configured") {
    return NextResponse.json({ valid: false, reason: "service_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ valid: false, reason: result.reason });
}

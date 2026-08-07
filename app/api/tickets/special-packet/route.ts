import { NextResponse } from "next/server";
import { getSpecialPacketStatus } from "@/features/tickets/server/special-packet";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSpecialPacketStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}

import { NextResponse } from "next/server";
import { getTicketDiscountStatus } from "@/features/tickets/server/ticket-discount";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getTicketDiscountStatus());
}

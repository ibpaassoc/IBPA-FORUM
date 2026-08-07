import { NextResponse } from "next/server";

import { getPublicStripePricing } from "@/features/pricing/server/stripe-pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPublicStripePricing(), {
    headers: { "Cache-Control": "no-store" },
  });
}

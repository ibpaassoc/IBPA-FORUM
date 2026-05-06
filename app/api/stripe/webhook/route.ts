import { NextResponse } from "next/server";
import { processStripeWebhook } from "@/features/payments/server/webhook-dispatch";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.info("POST /api/stripe/webhook called", {
    hasStripeSignature: Boolean(request.headers.get("stripe-signature")),
  });

  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await processStripeWebhook({
      payload,
      signature,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/stripe/webhook unhandled error", error);
    return NextResponse.json(
      { message: "Failed to process Stripe webhook." },
      { status: 500 }
    );
  }
}

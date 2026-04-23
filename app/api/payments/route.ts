import { NextRequest, NextResponse } from "next/server";
import { retryCompetitorApplicationPayment } from "@/lib/apply/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      applicationId?: string;
    };
    const applicationId = body.applicationId?.trim();

    if (!applicationId) {
      return NextResponse.json(
        { message: "Application id is required." },
        { status: 400 }
      );
    }

    const result = await retryCompetitorApplicationPayment(applicationId);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/payments error:", error);

    return NextResponse.json(
      { message: "We could not restart Stripe Checkout right now." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { validateMembershipNumber } from "@/features/applications/server/membership";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      membershipNumber?: string;
    };
    const membershipNumber = String(body.membershipNumber ?? "");
    const result = await validateMembershipNumber(membershipNumber);

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/membership/validate error:", error);

    return NextResponse.json(
      {
        message: "Failed to validate membership number.",
      },
      { status: 500 }
    );
  }
}

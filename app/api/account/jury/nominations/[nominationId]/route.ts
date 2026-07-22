import { NextResponse } from "next/server";
import {
  getAuthenticatedJuryApiContext,
  getJuryNominationReviewDetail,
} from "@/features/jury/server/reviews";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nominationId: string }> }
) {
  try {
    const judge = await getAuthenticatedJuryApiContext();
    const { nominationId } = await params;
    const data = await getJuryNominationReviewDetail({
      judge,
      nominationId,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Request failed." },
        { status: error.status }
      );
    }

    console.error("GET /api/account/jury/nominations/[nominationId] error:", error);
    return NextResponse.json(
      { message: "Failed to load nomination review." },
      { status: 500 }
    );
  }
}

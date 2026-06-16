import { NextResponse } from "next/server";
import {
  getAuthenticatedJudgeScoringApiContext,
  getJudgeApplicationScoringDetail,
} from "@/features/admin/server/jury";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const judge = await getAuthenticatedJudgeScoringApiContext();
    const { applicationId: nominationApplicationId } = await params;
    const data = await getJudgeApplicationScoringDetail({
      judge,
      nominationApplicationId,
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

    console.error("GET /api/jury/scoring/[applicationId] error:", error);
    return NextResponse.json(
      { message: "Failed to load application scoring detail." },
      { status: 500 }
    );
  }
}

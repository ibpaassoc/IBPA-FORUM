import { NextResponse } from "next/server";
import { submitScoreSchema } from "@/features/admin/actions/scoring_schemas";
import {
  getAuthenticatedJudgeScoringApiContext,
  submitJudgeScore,
} from "@/features/admin/server/jury";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const judge = await getAuthenticatedJudgeScoringApiContext();
    const { applicationId: nominationApplicationId } = await params;
    const parsed = submitScoreSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid final score payload.",
        },
        { status: 400 }
      );
    }

    const score = await submitJudgeScore({
      judge,
      nominationApplicationId,
      input: parsed.data,
    });

    return NextResponse.json(score);
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

    console.error("POST /api/jury/scoring/[applicationId]/submit error:", error);
    return NextResponse.json({ message: "Failed to submit final score." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { draftScoreSchema } from "@/features/admin/actions/scoring_schemas";
import {
  getAuthenticatedJudgeScoringApiContext,
  saveJudgeScoreDraft,
} from "@/features/admin/server/jury";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const judge = await getAuthenticatedJudgeScoringApiContext();
    const { applicationId: nominationApplicationId } = await params;
    const parsed = draftScoreSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid draft score payload.",
        },
        { status: 400 }
      );
    }

    const score = await saveJudgeScoreDraft({
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

    console.error("POST /api/jury/scoring/[applicationId]/draft error:", error);
    return NextResponse.json({ message: "Failed to save score draft." }, { status: 500 });
  }
}

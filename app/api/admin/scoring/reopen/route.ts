import { NextResponse } from "next/server";
import { reopenJudgeScore } from "@/features/admin/server/admin";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { message: adminT.api.unauthorized },
        { status: 401 }
      );
    }
    const body = (await request.json()) as { scoreId?: string };
    const scoreId = String(body.scoreId ?? "").trim();

    if (!scoreId) {
      return NextResponse.json({ message: adminT.api.missingScoreId }, { status: 400 });
    }

    const score = await reopenJudgeScore(scoreId);
    return NextResponse.json(score);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : adminT.api.requestFailed },
        { status: error.status }
      );
    }

    console.error("POST /api/admin/scoring/reopen error:", error);
    return NextResponse.json({ message: adminT.api.reopenScoreFailed }, { status: 500 });
  }
}

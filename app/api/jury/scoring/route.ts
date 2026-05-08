import { NextResponse } from "next/server";
import {
  getAuthenticatedJudgeScoringApiContext,
  getJudgeAssignedApplications,
} from "@/features/admin/server/jury";

export async function GET(request: Request) {
  try {
    const judge = await getAuthenticatedJudgeScoringApiContext();
    const url = new URL(request.url);
    const category = url.searchParams.get("category") ?? undefined;
    const data = await getJudgeAssignedApplications({
      judge,
      category,
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

    console.error("GET /api/jury/scoring error:", error);
    return NextResponse.json({ message: "Failed to load scoring data." }, { status: 500 });
  }
}

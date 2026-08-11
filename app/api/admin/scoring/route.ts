import { NextResponse } from "next/server";
import { getAdminScoringOverview } from "@/features/admin/server/admin";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { message: adminT.api.unauthorized },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const data = await getAdminScoringOverview({
      category:
        url.searchParams.get("category") ??
        url.searchParams.get("direction") ??
        undefined,
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
      minScore: url.searchParams.get("minScore") ?? undefined,
      maxScore: url.searchParams.get("maxScore") ?? undefined,
      progress: url.searchParams.get("progress") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      perPage: url.searchParams.get("perPage") ?? undefined,
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
        { message: error instanceof Error ? error.message : adminT.api.requestFailed },
        { status: error.status }
      );
    }

    console.error("GET /api/admin/scoring error:", error);
    return NextResponse.json(
      { message: adminT.api.scoringOverviewFailed },
      { status: 500 }
    );
  }
}

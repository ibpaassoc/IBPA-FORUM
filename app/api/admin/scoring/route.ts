import { NextResponse } from "next/server";
import { getAdminScoringOverview } from "@/features/admin/server/admin";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { message: "Admin authentication is required." },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const data = await getAdminScoringOverview({
      category: url.searchParams.get("category") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
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

    console.error("GET /api/admin/scoring error:", error);
    return NextResponse.json(
      { message: "Failed to load admin scoring overview." },
      { status: 500 }
    );
  }
}

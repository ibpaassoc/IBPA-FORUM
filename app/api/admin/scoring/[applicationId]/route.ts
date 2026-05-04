import { NextResponse } from "next/server";
import { getAdminApplicationScoringDetail } from "@/features/scoring/server/admin";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { message: "Admin authentication is required." },
        { status: 401 }
      );
    }
    const { applicationId } = await params;
    const detail = await getAdminApplicationScoringDetail(applicationId);

    if (!detail) {
      return NextResponse.json(
        { message: "The participant application could not be found." },
        { status: 404 }
      );
    }

    return NextResponse.json(detail);
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

    console.error("GET /api/admin/scoring/[applicationId] error:", error);
    return NextResponse.json(
      { message: "Failed to load admin scoring detail." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { exportApplicationScoresCsv } from "@/features/admin/server/admin";
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
    const csv = await exportApplicationScoresCsv(applicationId);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="application-${applicationId}-scores.csv"`,
      },
    });
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

    console.error("GET /api/admin/scoring/[applicationId]/export error:", error);
    return NextResponse.json({ message: "Failed to export score data." }, { status: 500 });
  }
}

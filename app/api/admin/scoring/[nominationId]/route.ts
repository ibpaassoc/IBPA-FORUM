import { NextResponse } from "next/server";
import { getAdminApplicationScoringDetail } from "@/features/admin/server/admin";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nominationId: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { message: adminT.api.unauthorized },
        { status: 401 }
      );
    }
    const { nominationId } = await params;
    const detail = await getAdminApplicationScoringDetail(nominationId);

    if (!detail) {
      return NextResponse.json(
        { message: adminT.api.participantApplicationNotFound },
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
        { message: error instanceof Error ? error.message : adminT.api.requestFailed },
        { status: error.status }
      );
    }

    console.error("GET /api/admin/scoring/[nominationId] error:", error);
    return NextResponse.json(
      { message: adminT.api.scoringDetailFailed },
      { status: 500 }
    );
  }
}

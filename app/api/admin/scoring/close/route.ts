import { NextResponse } from "next/server";
import { closeScoring } from "@/features/jury/server/scoring-state";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function POST() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: adminT.api.unauthorized }, { status: 401 });
    }

    const result = await closeScoring();
    return NextResponse.json({
      ...result,
      state: {
        ...result.state,
        closedAt: result.state.closedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/scoring/close error:", error);
    return NextResponse.json({ message: adminT.scoring.closeError }, { status: 500 });
  }
}

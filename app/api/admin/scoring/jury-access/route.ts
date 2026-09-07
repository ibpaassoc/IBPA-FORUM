import { NextResponse } from "next/server";
import { setJuryScoringAccess } from "@/features/jury/server/scoring-state";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: adminT.api.unauthorized }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | { juryId?: string; open?: boolean }
      | null;
    const juryProfileId = String(body?.juryId ?? "").trim();
    const open = body?.open;

    if (!juryProfileId || typeof open !== "boolean") {
      return NextResponse.json({ message: adminT.api.invalidRequest }, { status: 400 });
    }

    const result = await setJuryScoringAccess({ juryProfileId, open });
    return NextResponse.json({
      changed: result.changed,
      state: {
        ...result.state,
        closedAt: result.state.closedAt?.toISOString() ?? null,
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
        { message: error instanceof Error ? error.message : adminT.api.requestFailed },
        { status: error.status }
      );
    }

    console.error("POST /api/admin/scoring/jury-access error:", error);
    return NextResponse.json({ message: adminT.api.juryScoringAccessFailed }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { approveJuryApplication } from "@/features/jury/server/commands";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        message: adminT.actions.missingJuryApplicationId,
      },
      { status: 400 }
    );
  }

  try {
    await approveJuryApplication(id);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to approve jury application", error);

    return NextResponse.json(
      {
        message: adminT.api.approveJuryFailed,
      },
      { status: 400 }
    );
  }
}

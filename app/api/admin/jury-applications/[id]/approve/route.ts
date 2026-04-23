import { NextResponse } from "next/server";
import { approveJuryApplication } from "@/features/jury/server/commands";
import { requireAdmin } from "@/shared/lib/admin-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Missing jury application id.",
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
        message:
          error instanceof Error
            ? error.message
            : "Could not approve the jury application.",
      },
      { status: 400 }
    );
  }
}

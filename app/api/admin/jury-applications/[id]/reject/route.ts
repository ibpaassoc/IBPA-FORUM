import { NextResponse } from "next/server";
import { rejectJuryApplication } from "@/features/jury/server/commands";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

async function getAdminNotes(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { adminNotes?: string };
    return body.adminNotes ?? "";
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return String(formData.get("adminNotes") ?? "");
  }

  return "";
}

export async function POST(
  request: Request,
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
    await rejectJuryApplication({
      id,
      adminNotes: await getAdminNotes(request),
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to reject jury application", error);

    return NextResponse.json(
      {
        message: adminT.api.rejectJuryFailed,
      },
      { status: 400 }
    );
  }
}

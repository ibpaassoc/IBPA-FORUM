import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { rejectJuryApplication } from "@/lib/jury/service";

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
        message: "Missing jury application id.",
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
        message:
          error instanceof Error
            ? error.message
            : "Could not reject the jury application.",
      },
      { status: 400 }
    );
  }
}

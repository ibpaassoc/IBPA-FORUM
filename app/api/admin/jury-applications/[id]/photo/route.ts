import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { replaceJuryProfilePhoto } from "@/features/jury/server/commands";
import type { BlobFileInfo } from "@/features/jury/server/uploads";
import { getProfilePhotoRejectReason } from "@/features/jury/lib/profile-photo";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing application id." }, { status: 400 });
  }

  let body: { profilePhotoBlob?: BlobFileInfo | null };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const blob = body.profilePhotoBlob;

  if (!blob || !blob.storageKey) {
    return NextResponse.json({ error: "No photo was uploaded." }, { status: 400 });
  }

  // The client uploads straight to Vercel Blob via /api/jury/upload, which only
  // issues tokens for `jury/` paths — reject anything else defensively.
  if (!blob.storageKey.startsWith("jury/")) {
    return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
  }

  const rejectReason = getProfilePhotoRejectReason(blob);
  if (rejectReason === "type") {
    return NextResponse.json(
      { error: "Photo must be a JPG, PNG, or WebP image." },
      { status: 400 }
    );
  }
  if (rejectReason === "size") {
    return NextResponse.json(
      { error: "Photo exceeds the maximum size of 25 MB." },
      { status: 400 }
    );
  }

  try {
    await replaceJuryProfilePhoto(id, blob);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  revalidatePath(`/admin/jury-applications/${id}/edit`);

  return NextResponse.json({ ok: true });
}

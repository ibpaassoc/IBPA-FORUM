import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { replaceJuryProfilePhoto } from "@/features/jury/server/commands";
import { revalidatePublicJuryMembers } from "@/features/jury/server/queries";
import type { BlobFileInfo } from "@/features/jury/server/uploads";
import { getProfilePhotoRejectReason } from "@/features/jury/lib/profile-photo";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: adminT.api.unauthorized }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: adminT.actions.missingApplicationId }, { status: 400 });
  }

  let body: { profilePhotoBlob?: BlobFileInfo | null };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: adminT.api.invalidRequest }, { status: 400 });
  }

  const blob = body.profilePhotoBlob;

  if (!blob || !blob.storageKey) {
    return NextResponse.json({ error: adminT.api.noPhotoUploaded }, { status: 400 });
  }

  // The client uploads straight to Vercel Blob via /api/jury/upload, which only
  // issues tokens for `jury/` paths — reject anything else defensively.
  if (!blob.storageKey.startsWith("jury/")) {
    return NextResponse.json({ error: adminT.api.invalidUploadPath }, { status: 400 });
  }

  const rejectReason = getProfilePhotoRejectReason(blob);
  if (rejectReason === "type") {
    return NextResponse.json(
      { error: adminT.api.photoInvalidType },
      { status: 400 }
    );
  }
  if (rejectReason === "size") {
    return NextResponse.json(
      { error: adminT.api.photoTooLarge },
      { status: 400 }
    );
  }

  try {
    await replaceJuryProfilePhoto(id, blob);
  } catch (error) {
    const status = error instanceof Error && error.message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: adminT.edit.photoSaveError }, { status });
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  revalidatePath(`/admin/jury-applications/${id}/edit`);

  // The public /jury listing caches the profile-photo file id; without this the
  // swap only appears after the timed cache window (production-only, since dev
  // does not persist these caches).
  revalidatePublicJuryMembers();

  return NextResponse.json({ ok: true });
}

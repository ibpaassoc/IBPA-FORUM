import { get } from "@vercel/blob";
import { prisma } from "@/shared/lib/prisma";
import { isPublicBlobUrl } from "@/features/jury/lib/profile-photo";

/**
 * Serves an approved jury member's profile photo.
 *
 * Photos are stored as private blobs (`storageKey` holds a pathname) and are
 * streamed through this route using the read/write token. Some early records may
 * instead hold a public blob URL, which `resolveJuryPhotoSrc` serves directly so
 * those never reach this route.
 *
 * The route never throws and never returns an empty/`null` body: any failure
 * (missing record, missing token, blob 403/404, unexpected error) resolves to a
 * clean `404` so the client image `onError` fallback can render a placeholder.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const fileRecord = await prisma.juryApplicationFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      storageKey: true,
      fieldKey: true,
      juryApplication: {
        select: {
          status: true,
          paymentStatus: true,
        },
      },
    },
  });

  if (
    !fileRecord?.storageKey ||
    fileRecord.fieldKey !== "profilePhoto" ||
    fileRecord.juryApplication.status !== "PAID" ||
    fileRecord.juryApplication.paymentStatus !== "PAID"
  ) {
    return new Response("Not found", { status: 404 });
  }

  let result;
  try {
    result = await get(fileRecord.storageKey, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
  } catch (error) {
    // A blob-access failure (e.g. a token/permission error in production) must
    // not surface as a 500 that breaks <Image>; log safe metadata and 404 so
    // the UI falls back gracefully.
    console.error("jury profile-photo blob fetch failed", {
      fileId,
      hasStorageKey: true,
      status:
        typeof error === "object" && error && "status" in error
          ? (error as { status?: number }).status
          : undefined,
    });
    return new Response("Not found", { status: 404 });
  }

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  if (result.statusCode === 304) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const encodedFileName = encodeURIComponent(fileRecord.fileName);
  const asciiFallback = fileRecord.fileName.replace(/[^\x20-\x7E]/g, "_");

  return new Response(result.stream, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.mimeType || result.blob.contentType,
      "Content-Disposition": `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodedFileName}`,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "public, max-age=300",
    },
  });
}

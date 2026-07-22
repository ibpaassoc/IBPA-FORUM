import { get } from "@vercel/blob";
import { getAppSession } from "@/auth";
import { prisma } from "@/shared/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await getAppSession();

  if (session?.user.role !== "APPLICANT" || !session.user.applicantProfileId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { fileId } = await params;
  const fileRecord = await prisma.nominationFile.findFirst({
    where: {
      id: fileId,
      deletedAt: null,
      nominationApplication: {
        applicantProfileId: session.user.applicantProfileId,
        deletedAt: null,
      },
    },
    select: {
      fileName: true,
      displayFileName: true,
      mimeType: true,
      fileUrl: true,
    },
  });

  if (!fileRecord?.fileUrl) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(fileRecord.fileUrl, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  if (result.statusCode === 304) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  const fileName = fileRecord.displayFileName || fileRecord.fileName;
  const encodedFileName = encodeURIComponent(fileName);
  const asciiFallback = fileName
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");

  return new Response(result.stream, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.mimeType || result.blob.contentType,
      "Content-Disposition": `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodedFileName}`,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}

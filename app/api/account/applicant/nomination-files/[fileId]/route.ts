import { get } from "@vercel/blob";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { prisma } from "@/shared/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });

  const { fileId } = await params;
  const fileRecord = await prisma.nominationFile.findFirst({
    where: {
      id: fileId,
      deletedAt: null,
      nominationApplication: {
        applicantProfileId: applicantProfile.id,
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

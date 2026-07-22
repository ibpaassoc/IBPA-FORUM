import { get } from "@vercel/blob";
import { requireJuryAuth } from "@/features/jury/server/auth";
import { prisma } from "@/shared/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const juryUser = await requireJuryAuth();
  const { fileId } = await params;

  const fileRecord = await prisma.nominationFile.findUnique({
    where: { id: fileId },
    include: {
      nominationApplication: {
        select: {
          status: true,
          paymentStatus: true,
          closedIncompleteAt: true,
          deletedAt: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  if (
    !juryUser.approvalStatus ||
    !["APPROVED", "PAID"].includes(juryUser.approvalStatus) ||
    !fileRecord?.fileUrl ||
    fileRecord.deletedAt ||
    fileRecord.nominationApplication.deletedAt ||
    fileRecord.nominationApplication.closedIncompleteAt ||
    fileRecord.nominationApplication.paymentStatus !== "PAID" ||
    !["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"].includes(fileRecord.nominationApplication.status) ||
    !juryUser.expertiseAreas.includes(fileRecord.nominationApplication.category.name)
  ) {
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

  return new Response(result.stream, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.mimeType || result.blob.contentType,
      "Content-Disposition": `inline; filename="${fileRecord.displayFileName || fileRecord.fileName}"`,
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}

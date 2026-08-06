import { requireJuryAuth } from "@/features/jury/server/auth";
import { streamPrivateBlobFile } from "@/shared/lib/blob-file-response";
import { prisma } from "@/shared/lib/prisma";
import { activateRequestDataScope } from "@/features/test/server/data-scope";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const juryUser = await requireJuryAuth();
  activateRequestDataScope({ dataScope: juryUser.dataScope });
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
    !juryUser.approvedCategories.includes(fileRecord.nominationApplication.category.name)
  ) {
    return new Response("Not found", { status: 404 });
  }

  const response = await streamPrivateBlobFile({
    request,
    pathname: fileRecord.fileUrl,
    fileName: fileRecord.displayFileName || fileRecord.fileName,
    mimeType: fileRecord.mimeType,
  });

  return response ?? new Response("Not found", { status: 404 });
}

import { requireJuryAuth } from "@/features/jury/server/auth";
import { streamPrivateBlobFile } from "@/shared/lib/blob-file-response";
import { prisma } from "@/shared/lib/prisma";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { parseStoredFiles } from "@/features/database/json-fields";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const juryUser = await requireJuryAuth();
  activateRequestDataScope({ dataScope: juryUser.dataScope });
  const { fileId } = await params;

  const nominations = await prisma.nomination.findMany({
    where: {
      payment: { status: "PAID" },
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "LOCKED", "SCORED"] },
      category: { name: { in: juryUser.approvedCategories } },
    },
    select: { files: true },
  });
  const fileRecord = nominations.flatMap((nomination) => parseStoredFiles(nomination.files).items).find((file) => file.id === fileId);
  const pathname = fileRecord?.blobKey ?? fileRecord?.url;

  if (
    !juryUser.approvalStatus ||
    !["APPROVED", "PAID"].includes(juryUser.approvalStatus) ||
    !fileRecord ||
    !pathname
  ) {
    return new Response("Not found", { status: 404 });
  }

  const response = await streamPrivateBlobFile({
    request,
    pathname,
    fileName: fileRecord.filename,
    mimeType: fileRecord.mimeType,
  });

  return response ?? new Response("Not found", { status: 404 });
}

import { requireApplicantAccount } from "@/features/account/server/accounts";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { streamPrivateBlobFile } from "@/shared/lib/blob-file-response";
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

  const response = await streamPrivateBlobFile({
    request,
    pathname: fileRecord.fileUrl,
    fileName: fileRecord.displayFileName || fileRecord.fileName,
    mimeType: fileRecord.mimeType,
  });

  return response ?? new Response("Not found", { status: 404 });
}

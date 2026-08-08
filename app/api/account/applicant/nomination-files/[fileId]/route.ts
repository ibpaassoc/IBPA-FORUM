import { requireApplicantAccount } from "@/features/account/server/accounts";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { streamPrivateBlobFile } from "@/shared/lib/blob-file-response";
import { prisma } from "@/shared/lib/prisma";
import { parseStoredFiles } from "@/features/database/json-fields";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });

  const { fileId } = await params;
  const nominations = await prisma.nomination.findMany({
    where: {
      applicantProfileId: applicantProfile.id,
      status: { not: "ARCHIVED" },
    },
    select: { files: true },
  });
  const fileRecord = nominations.flatMap((nomination) => parseStoredFiles(nomination.files).items).find((file) => file.id === fileId);
  const pathname = fileRecord?.blobKey ?? fileRecord?.url;

  if (!fileRecord || !pathname) {
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

import { parseJuryInformationRequests, parseStoredFiles } from "@/features/database/json-fields";
import type { JuryApplicationFileView } from "@/features/jury/types/files";
import { prisma } from "@/shared/lib/prisma";

function fileViews(value: unknown): JuryApplicationFileView[] {
  return parseStoredFiles(value).items.map((file) => ({
    id: file.id,
    fieldKey: file.fieldId,
    fileName: file.filename,
    mimeType: file.mimeType,
    fileSize: file.size,
    storageKey: file.blobKey ?? null,
    createdAt: new Date(file.uploadedAt),
  }));
}

export async function getJuryApplications() {
  const rows = await prisma.juryApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { approvedCategories: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, paidAt: true } },
    },
  });
  const applications = rows.map((application) => ({
    ...application,
    approvedCategories: application.profile?.approvedCategories ?? [],
    paymentStatus: application.payments[0]?.status ?? "PENDING",
    paidAt: application.payments[0]?.paidAt ?? null,
  }));
  return {
    applications,
    totalCount: applications.length,
    pendingCount: applications.filter((application) => application.status === "SUBMITTED").length,
    approvedCount: applications.filter((application) => application.status === "APPROVED").length,
    activeJudgeCount: applications.filter((application) => application.status === "PAID").length,
  };
}

export async function getJuryApplicationDetail(id: string) {
  const application = await prisma.juryApplication.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, paidAt: true } },
      profile: {
        select: {
          approvedCategories: true,
          account: { select: { status: true, passwordHash: true } },
        },
      },
    },
  });
  if (!application) return null;
  const requests = parseJuryInformationRequests(application.informationRequests).requests;
  const latestRequest = requests.at(-1);
  return {
    ...application,
    files: fileViews(application.files),
    approvedCategories: application.profile?.approvedCategories ?? [],
    paymentStatus: application.payments[0]?.status ?? "PENDING",
    paidAt: application.payments[0]?.paidAt ?? null,
    infoRequestDetails: latestRequest?.message ?? null,
    infoRequestedAt: latestRequest ? new Date(latestRequest.requestedAt) : null,
    infoResubmittedAt: latestRequest?.resolvedAt ? new Date(latestRequest.resolvedAt) : null,
  };
}

import "server-only";

import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { getScenarioDeletionPreview } from "@/features/test/server/cleanup";

export async function getTestCreationRegistry() {
  const [records, scenarios, audits] = await Promise.all([
    runWithDataScope({ dataScope: "TEST" }, async () => {
      const [accounts, profiles, juryApplications, nominations, reviews, tickets, qrCredentials, nominationFiles, juryFiles, emails, payments] = await Promise.all([
        prisma.account.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            applicantProfile: { select: { id: true, fullName: true, _count: { select: { nominations: true } } } },
            juryProfile: { select: { id: true, fullName: true, _count: { select: { reviews: true } } } },
          },
        }),
        prisma.applicantProfile.findMany({
          orderBy: { createdAt: "desc" },
          include: { account: { select: { email: true } }, _count: { select: { nominations: true, payments: true, tickets: true } } },
        }),
        prisma.juryApplication.findMany({
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { files: true, payments: true } } },
        }),
        prisma.nominationApplication.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            applicantProfile: { select: { fullName: true } },
            category: { select: { name: true } },
            award: { select: { name: true } },
            _count: { select: { answers: true, files: true, reviews: true } },
          },
        }),
        prisma.juryNominationReview.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            juryProfile: { select: { fullName: true } },
            nomination: { include: { award: { select: { name: true } } } },
          },
        }),
        prisma.ticket.findMany({
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { payments: true, qrCredentials: true, activities: true } } },
        }),
        prisma.ticketQrCredential.findMany({
          orderBy: { generatedAt: "desc" },
          include: { ticket: { select: { fullName: true } } },
        }),
        prisma.nominationFile.findMany({
          orderBy: { createdAt: "desc" },
          include: { nominationApplication: { select: { applicantProfile: { select: { fullName: true } } } } },
        }),
        prisma.juryApplicationFile.findMany({
          orderBy: { createdAt: "desc" },
          include: { juryApplication: { select: { fullName: true } } },
        }),
        prisma.emailDeliveryLog.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.payment.findMany({ orderBy: { createdAt: "desc" } }),
      ]);
      return { accounts, profiles, juryApplications, nominations, reviews, tickets, qrCredentials, uploads: [...nominationFiles.map((file) => ({ ...file, owner: file.nominationApplication.applicantProfile.fullName, uploadType: "nomination" as const })), ...juryFiles.map((file) => ({ ...file, owner: file.juryApplication.fullName, uploadType: "jury" as const }))], emails, payments };
    }),
    unscopedPrisma.testScenario.findMany({ orderBy: { createdAt: "desc" } }),
    unscopedPrisma.testAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
  ]);
  const scenarioPreviews = await Promise.all(scenarios.map(async (scenario) => ({ scenario, preview: await getScenarioDeletionPreview(scenario.id) })));
  return { ...records, scenarios: scenarioPreviews, audits };
}

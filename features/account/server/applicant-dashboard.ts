import "server-only";

import { requireApplicantAccount } from "@/features/account/server/accounts";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  getApplicantApplicationsClosedAt,
  getApplicantSubmissionDeadline,
} from "@/features/applications/server/deadlines";
import { generateTicketQRDataUrl } from "@/features/tickets/server/ticket-qr";
import { prisma } from "@/shared/lib/prisma";
import { activateRequestDataScope } from "@/features/test/server/data-scope";
import { parseNominationAnswers, parseStoredFiles, parseTicketCredential } from "@/features/database/json-fields";

export async function getApplicantDashboardData() {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });

  const [nominations, tickets, globalDeadline, closedAt] = await Promise.all([
    prisma.nomination.findMany({
      where: { applicantProfileId: applicantProfile.id, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        payment: { select: { status: true, paidAt: true } },
        submittedAt: true,
        scoresReleasedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        award: { select: { name: true } },
        answers: true,
        files: true,
        reviews: {
          where: { status: "COMPLETED" },
          select: { totalScore: true },
        },
      },
    }),
    prisma.ticket.findMany({
      where: {
        kind: "FORUM",
        OR: [
          { accountId: account.id },
          { applicantProfileId: applicantProfile.id },
          { email: account.email },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        type: true,
        galaDinner: true,
        status: true,
        paidAt: true,
        createdAt: true,
        secureToken: true,
        credential: true,
      },
    }),
    getApplicantSubmissionDeadline(),
    getApplicantApplicationsClosedAt(),
  ]);

  const nominationCards = nominations.map((nomination) => {
    const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
    const requiredFields = fields.filter((field) => field.required);
    const answeredKeys = new Set(parseNominationAnswers(nomination.answers).fields.map((answer) => answer.fieldId));
    const fileKeys = new Set(parseStoredFiles(nomination.files).items.map((file) => file.fieldId));
    const missingRequiredFields = requiredFields.filter((field) =>
      field.type === "file" ? !fileKeys.has(field.key) : !answeredKeys.has(field.key)
    );
    const completionPercentage =
      requiredFields.length === 0
        ? 100
        : Math.round(((requiredFields.length - missingRequiredFields.length) / requiredFields.length) * 100);

    return {
      ...nomination,
      paymentStatus: nomination.payment.status,
      paidAt: nomination.payment.paidAt,
      locked: nomination.status === "LOCKED",
      completionPercentage,
      missingRequiredCount: missingRequiredFields.length,
    };
  });

  const ticketCards = await Promise.all(
    tickets.map(async (ticket) => {
      const activeQr = parseTicketCredential(ticket.credential).active;
      return {
        ...ticket,
        secureToken: undefined,
        credential: undefined,
        activeQrGeneratedAt: activeQr?.generatedAt ?? null,
        qrDataUrl: activeQr ? await generateTicketQRDataUrl(ticket.secureToken) : null,
      };
    })
  );

  return {
    account,
    applicantProfile,
    nominations: nominationCards,
    tickets: ticketCards,
    deadline: applicantProfile.deadlineOverrideAt ?? globalDeadline,
    closedAt,
  };
}

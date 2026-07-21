import "server-only";

import { requireApplicantAccount } from "@/features/account/server/accounts";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import {
  getApplicantApplicationsClosedAt,
  getApplicantSubmissionDeadline,
} from "@/features/applications/server/deadlines";
import { generateTicketQRDataUrl } from "@/features/tickets/server/ticket-qr";
import { prisma } from "@/shared/lib/prisma";

export async function getApplicantDashboardData() {
  const { account, applicantProfile } = await requireApplicantAccount();

  const [nominations, tickets, deadline, closedAt] = await Promise.all([
    prisma.nominationApplication.findMany({
      where: { applicantProfileId: applicantProfile.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paidAt: true,
        submittedAt: true,
        lockedAt: true,
        scoresReleasedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        award: { select: { name: true } },
        answers: { select: { fieldKey: true } },
        files: { where: { deletedAt: null }, select: { fieldKey: true } },
        reviews: {
          where: { status: "COMPLETED" },
          select: { totalScore: true },
        },
      },
    }),
    prisma.ticket.findMany({
      where: {
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
        qrCredentials: {
          where: { status: "ACTIVE" },
          orderBy: { generatedAt: "desc" },
          take: 1,
          select: {
            id: true,
            token: true,
            generatedAt: true,
          },
        },
      },
    }),
    getApplicantSubmissionDeadline(),
    getApplicantApplicationsClosedAt(),
  ]);

  const nominationCards = nominations.map((nomination) => {
    const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
    const requiredFields = fields.filter((field) => field.required);
    const answeredKeys = new Set(nomination.answers.map((answer) => answer.fieldKey));
    const fileKeys = new Set(nomination.files.map((file) => file.fieldKey));
    const missingRequiredFields = requiredFields.filter((field) =>
      field.type === "file" ? !fileKeys.has(field.key) : !answeredKeys.has(field.key)
    );
    const completionPercentage =
      requiredFields.length === 0
        ? 100
        : Math.round(((requiredFields.length - missingRequiredFields.length) / requiredFields.length) * 100);

    return {
      ...nomination,
      completionPercentage,
      missingRequiredCount: missingRequiredFields.length,
    };
  });

  const ticketCards = await Promise.all(
    tickets.map(async (ticket) => {
      const activeQr = ticket.qrCredentials[0] ?? null;
      return {
        ...ticket,
        secureToken: undefined,
        qrCredentials: undefined,
        activeQrGeneratedAt: activeQr?.generatedAt ?? null,
        qrDataUrl: activeQr ? await generateTicketQRDataUrl(activeQr.token) : null,
      };
    })
  );

  return {
    account,
    applicantProfile,
    nominations: nominationCards,
    tickets: ticketCards,
    deadline,
    closedAt,
  };
}

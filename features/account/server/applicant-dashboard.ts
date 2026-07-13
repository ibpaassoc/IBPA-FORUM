import "server-only";

import { requireApplicantAccount } from "@/features/account/server/accounts";
import { generateTicketQRDataUrl } from "@/features/tickets/server/ticket-qr";
import { prisma } from "@/shared/lib/prisma";

export async function getApplicantDashboardData() {
  const { account, applicantProfile } = await requireApplicantAccount();

  const [nominations, tickets] = await Promise.all([
    prisma.nominationApplication.findMany({
      where: { applicantProfileId: applicantProfile.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        amount: true,
        currency: true,
        paidAt: true,
        submittedAt: true,
        lockedAt: true,
        scoresReleasedAt: true,
        updatedAt: true,
        category: { select: { name: true } },
        award: { select: { name: true } },
        judgeScores: {
          where: { status: "SUBMITTED" },
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
  ]);

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
    nominations,
    tickets: ticketCards,
    totals: {
      nominations: nominations.length,
      paid: nominations.filter((item) => item.paymentStatus === "PAID").length,
      incomplete: nominations.filter((item) => item.paymentStatus !== "PAID" || item.status === "DRAFT").length,
      submitted: nominations.filter((item) => item.status === "SUBMITTED" || item.status === "UNDER_REVIEW" || item.status === "SCORED").length,
      locked: nominations.filter((item) => item.lockedAt !== null || item.status === "LOCKED").length,
    },
  };
}

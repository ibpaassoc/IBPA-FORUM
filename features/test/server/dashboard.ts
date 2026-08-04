import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";

export async function getTestDashboardCounts() {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const [applicants, jury, nominations, emails, tickets, reviews, scenarios, relatedCounts] =
      await Promise.all([
        prisma.account.count({ where: { role: "APPLICANT" } }),
        prisma.account.count({ where: { role: "JURY" } }),
        prisma.nominationApplication.count(),
        prisma.emailDeliveryLog.count(),
        prisma.ticket.count(),
        prisma.juryNominationReview.count(),
        prisma.testScenario.count(),
        Promise.all([
          prisma.applicantProfile.count(),
          prisma.juryProfile.count(),
          prisma.juryApplication.count(),
          prisma.payment.count(),
          prisma.nominationAnswer.count(),
          prisma.nominationFile.count(),
          prisma.juryApplicationFile.count(),
          prisma.ticketQrCredential.count(),
          prisma.ticketActivity.count(),
          prisma.accountSetupToken.count(),
          prisma.applicantCheckInCredential.count(),
          prisma.stripeWebhookEvent.count(),
        ]),
      ]);
    return {
      applicants,
      jury,
      nominations,
      emails,
      tickets,
      reviews,
      scenarios,
      all: applicants + jury + nominations + emails + tickets + reviews + relatedCounts.reduce((sum, count) => sum + count, 0),
    };
  });
}

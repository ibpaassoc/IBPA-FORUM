import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";

export async function getTestDashboardCounts() {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const [applicants, jury, nominations, emails, tickets, reviews, scenarios] =
      await Promise.all([
        prisma.account.count({ where: { role: "APPLICANT" } }),
        prisma.account.count({ where: { role: "JURY" } }),
        prisma.nominationApplication.count(),
        prisma.emailDeliveryLog.count(),
        prisma.ticket.count(),
        prisma.juryNominationReview.count(),
        prisma.testScenario.count(),
      ]);
    return {
      applicants,
      jury,
      nominations,
      emails,
      tickets,
      reviews,
      scenarios,
      all: applicants + jury + nominations + emails + tickets + reviews,
    };
  });
}


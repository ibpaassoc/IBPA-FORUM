import "server-only";

import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { parseTestEmailDeliveries } from "@/features/test/server/test-records";

export async function getTestDashboardCounts() {
  const [records, tests] = await Promise.all([
    runWithDataScope({ dataScope: "TEST" }, async () => {
      const [applicants, jury, nominations, tickets, reviews, profiles, juryProfiles, juryApplications, payments, webhooks] =
        await Promise.all([
          prisma.account.count({ where: { role: "APPLICANT" } }),
          prisma.account.count({ where: { role: "JURY" } }),
          prisma.nomination.count(),
          prisma.ticket.count(),
          prisma.juryNominationReview.count(),
          prisma.applicantProfile.count(),
          prisma.juryProfile.count(),
          prisma.juryApplication.count(),
          prisma.payment.count(),
          prisma.stripeWebhook.count(),
        ]);
      return {
        applicants,
        jury,
        nominations,
        tickets,
        reviews,
        related: profiles + juryProfiles + juryApplications + payments + webhooks,
      };
    }),
    unscopedPrisma.test.findMany({ select: { status: true, emailDeliveries: true } }),
  ]);
  const emails = tests.reduce(
    (total, test) => total + parseTestEmailDeliveries(test.emailDeliveries).deliveries.length,
    0,
  );
  const scenarios = tests.filter((test) => test.status !== "CLEANED").length;
  return {
    ...records,
    emails,
    scenarios,
    all:
      records.applicants +
      records.jury +
      records.nominations +
      records.tickets +
      records.reviews +
      records.related +
      emails,
  };
}

import "dotenv/config";

import { parseNominationAnswers, parseStoredFiles, parseTicketActivity, parseTicketCredential } from "@/features/database/json-fields";
import { prisma } from "@/shared/lib/prisma";

const PROTECTED_EMAILS = [
  "annakrainik86@gmail.com",
  "elenamutalieva@gmail.com",
  "farangizkarimava15@gmail.com",
  "9868851@gmail.com",
];

async function main() {
  const [accounts, applicantProfiles, juryApplications, juryProfiles, nominations, reviews, payments, tickets, webhooks, settings, tests, nominationRows, ticketRows, duplicateAccountEmails, duplicateApplicantAwards, orphanReviews, invalidOwnershipPayments] =
    await Promise.all([
      prisma.account.count(),
      prisma.applicantProfile.count(),
      prisma.juryApplication.count(),
      prisma.juryProfile.count(),
      prisma.nomination.count(),
      prisma.juryNominationReview.count(),
      prisma.payment.count(),
      prisma.ticket.count(),
      prisma.stripeWebhook.count(),
      prisma.siteSetting.count(),
      prisma.test.count(),
      prisma.nomination.findMany({ select: { id: true, answers: true, files: true } }),
      prisma.ticket.findMany({ select: { id: true, credential: true, activity: true } }),
      prisma.$queryRaw<Array<{ normalizedEmail: string; role: string; count: bigint }>>`
        SELECT "normalizedEmail", "role"::text, count(*) AS count
        FROM "Account"
        GROUP BY "normalizedEmail", "role"
        HAVING count(*) > 1
      `,
      prisma.$queryRaw<Array<{ applicantProfileId: string; awardId: string; count: bigint }>>`
        SELECT "applicantProfileId", "awardId", count(*) AS count
        FROM "Nomination"
        WHERE "status" <> 'ARCHIVED'
        GROUP BY "applicantProfileId", "awardId"
        HAVING count(*) > 1
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) AS count
        FROM "JuryNominationReview" r
        LEFT JOIN "JuryProfile" jp ON jp.id = r."juryProfileId"
        LEFT JOIN "Nomination" n ON n.id = r."nominationId"
        WHERE jp.id IS NULL OR n.id IS NULL
      `,
      prisma.payment.count({
        where: {
          OR: [
            { purchaseType: "NOMINATION", nominations: { none: {} } },
            { purchaseType: "JURY", juryApplicationId: null },
            { purchaseType: "TICKET", tickets: { none: {} } },
          ],
        },
      }),
    ]);

  let answers = 0;
  let files = 0;
  let invalidNominationJson = 0;
  for (const nomination of nominationRows) {
    try {
      answers += parseNominationAnswers(nomination.answers).fields.length;
      files += parseStoredFiles(nomination.files).items.length;
    } catch {
      invalidNominationJson += 1;
    }
  }
  let invalidTicketJson = 0;
  for (const ticket of ticketRows) {
    try {
      parseTicketCredential(ticket.credential);
      parseTicketActivity(ticket.activity);
    } catch {
      invalidTicketJson += 1;
    }
  }

  const protectedApplicants = await Promise.all(PROTECTED_EMAILS.map(async (normalizedEmail) => {
    const matches = await prisma.account.findMany({
      where: { normalizedEmail, role: "APPLICANT" },
      select: {
        id: true,
        passwordHash: true,
        setupTokenHash: true,
        applicantProfile: { select: { id: true, _count: { select: { nominations: true } } } },
      },
    });
    return {
      normalizedEmail,
      accountCount: matches.length,
      accountId: matches[0]?.id ?? null,
      applicantProfileId: matches[0]?.applicantProfile?.id ?? null,
      nominationCount: matches[0]?.applicantProfile?._count.nominations ?? 0,
      hasPasswordHash: Boolean(matches[0]?.passwordHash),
      hasSetupTokenHash: Boolean(matches[0]?.setupTokenHash),
    };
  }));

  console.log(JSON.stringify({
    counts: { accounts, applicantProfiles, juryApplications, juryProfiles, nominations, answers, files, reviews, payments, tickets, webhooks, settings, tests },
    integrity: {
      duplicateAccountIdentities: duplicateAccountEmails.map((item) => ({ role: item.role, count: Number(item.count) })),
      duplicateApplicantAwardPairs: duplicateApplicantAwards.map((item) => ({ applicantProfileId: item.applicantProfileId, awardId: item.awardId, count: Number(item.count) })),
      orphanReviews: Number(orphanReviews[0]?.count ?? 0),
      invalidOwnershipPayments,
      invalidNominationJson,
      invalidTicketJson,
      paidStripePaymentsMissingProviderReference: await prisma.payment.count({ where: { status: "PAID", provider: "STRIPE", stripeCheckoutSessionId: null, stripePaymentIntentId: null } }),
    },
    protectedApplicants,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());

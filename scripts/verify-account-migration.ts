import "dotenv/config";
import { prisma } from "@/shared/lib/prisma";

async function main() {
  const [
    accounts,
    applicantProfiles,
    juryProfiles,
    nominations,
    answers,
    files,
    payments,
    duplicateAccountEmails,
    duplicateJuryEmails,
    orphanNominations,
    orphanReviews,
    unmatchedTickets,
    duplicateApplicantAwards,
    orphanNominationFiles,
    orphanPayments,
    missingStripePaidPayments,
  ] = await Promise.all([
    prisma.account.count(),
    prisma.applicantProfile.count(),
    prisma.juryProfile.count(),
    prisma.nominationApplication.count(),
    prisma.nominationAnswer.count(),
    prisma.nominationFile.count(),
    prisma.payment.count(),
    prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
      SELECT lower(trim("email")) AS email, count(*) AS count
      FROM "Account"
      GROUP BY lower(trim("email"))
      HAVING count(*) > 1
      ORDER BY count(*) DESC
    `,
    prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
      SELECT lower(trim("email")) AS email, count(*) AS count
      FROM "JuryApplication"
      GROUP BY lower(trim("email"))
      HAVING count(*) > 1
      ORDER BY count(*) DESC
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) AS count
      FROM "NominationApplication"
      WHERE "applicantProfileId" IS NULL
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) AS count
      FROM "JuryNominationReview" r
      LEFT JOIN "JuryProfile" jp ON jp."id" = r."juryProfileId"
      LEFT JOIN "NominationApplication" n ON n."id" = r."nominationId"
      WHERE jp."id" IS NULL OR n."id" IS NULL
    `,
    prisma.ticket.count({
      where: {
        accountId: null,
        applicantProfileId: null,
      },
    }),
    prisma.$queryRaw<Array<{ applicantProfileId: string; awardId: string; count: bigint }>>`
      SELECT "applicantProfileId", "awardId", count(*) AS count
      FROM "NominationApplication"
      WHERE "applicantProfileId" IS NOT NULL AND "deletedAt" IS NULL
      GROUP BY "applicantProfileId", "awardId"
      HAVING count(*) > 1
      ORDER BY count(*) DESC
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) AS count
      FROM "NominationFile" nf
      LEFT JOIN "NominationApplication" na ON na."id" = nf."nominationApplicationId"
      WHERE na."id" IS NULL
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) AS count
      FROM "Payment"
      WHERE "source" = 'COMPETITOR'
        AND "applicantProfileId" IS NULL
        AND "applicantEmail" IS NULL
        AND "purchaseManifest" IS NULL
        AND "ticketId" IS NULL
        AND "juryApplicationId" IS NULL
    `,
    prisma.payment.count({
      where: {
        status: "PAID",
        provider: "stripe",
        stripeSessionId: null,
      },
    }),
  ]);

  const report = {
    accountsCreated: accounts,
    applicantProfilesCreated: applicantProfiles,
    juryProfilesMigrated: juryProfiles,
    nominationsMigrated: nominations,
    answersMigrated: answers,
    filesMigrated: files,
    paymentsMigrated: payments,
    orphanRecords: {
      nominationsWithoutApplicantProfile: Number(orphanNominations[0]?.count ?? 0),
      nominationReviewsWithoutOwner: Number(orphanReviews[0]?.count ?? 0),
      nominationFilesWithoutNomination: Number(orphanNominationFiles[0]?.count ?? 0),
      paymentsWithoutOwner: Number(orphanPayments[0]?.count ?? 0),
      ticketsWithoutAccountOrApplicantProfile: unmatchedTickets,
    },
    paidStripePaymentsMissingSession: missingStripePaidPayments,
    duplicateApplicantAwardPairs: duplicateApplicantAwards.map((item) => ({
      applicantProfileId: item.applicantProfileId,
      awardId: item.awardId,
      count: Number(item.count),
    })),
    duplicateNormalizedEmails: {
      accounts: duplicateAccountEmails.map((item) => ({
        email: item.email,
        count: Number(item.count),
      })),
      juryApplications: duplicateJuryEmails.map((item) => ({
        email: item.email,
        count: Number(item.count),
      })),
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

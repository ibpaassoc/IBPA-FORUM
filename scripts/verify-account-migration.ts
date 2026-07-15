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
    duplicateApplicationEmails,
    duplicateJuryEmails,
    applicantJuryConflicts,
    orphanNominations,
    orphanScores,
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
      FROM "Application"
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
    prisma.$queryRaw<Array<{ email: string }>>`
      SELECT DISTINCT lower(trim(a."email")) AS email
      FROM "Application" a
      JOIN "JuryApplication" j ON lower(trim(j."email")) = lower(trim(a."email"))
      ORDER BY email
    `,
    prisma.nominationApplication.count({
      where: { applicantProfileId: null },
    }),
    prisma.judgeScore.count({
      where: {
        nominationApplicationId: { not: null },
        juryProfileId: null,
      },
    }),
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
    prisma.payment.count({
      where: {
        source: "COMPETITOR",
        applicationId: null,
        applicantProfileId: null,
        nominationApplicationId: null,
        ticketId: null,
        juryApplicationId: null,
      },
    }),
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
      nominationsWithoutApplicantProfile: orphanNominations,
      nominationScoresWithoutJuryProfile: orphanScores,
      nominationFilesWithoutNomination: Number(orphanNominationFiles[0]?.count ?? 0),
      paymentsWithoutOwner: orphanPayments,
      ticketsWithoutAccountOrApplicantProfile: unmatchedTickets,
    },
    paidStripePaymentsMissingSession: missingStripePaidPayments,
    duplicateApplicantAwardPairs: duplicateApplicantAwards.map((item) => ({
      applicantProfileId: item.applicantProfileId,
      awardId: item.awardId,
      count: Number(item.count),
    })),
    duplicateNormalizedEmails: {
      applications: duplicateApplicationEmails.map((item) => ({
        email: item.email,
        count: Number(item.count),
      })),
      juryApplications: duplicateJuryEmails.map((item) => ({
        email: item.email,
        count: Number(item.count),
      })),
    },
    applicantJuryRoleConflicts: applicantJuryConflicts,
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

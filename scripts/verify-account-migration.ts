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
      ticketsWithoutAccountOrApplicantProfile: unmatchedTickets,
    },
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

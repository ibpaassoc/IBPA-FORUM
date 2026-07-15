import "dotenv/config";
import { prisma } from "@/shared/lib/prisma";
import { upsertApplicantAccountForApplication } from "@/features/account/server/accounts";

const apply = process.argv.includes("--apply");

async function main() {
  const [paidLegacyCount, unpaidLegacyCount, paidApplications] = await Promise.all([
    prisma.application.count({ where: { paymentStatus: "PAID" } }),
    prisma.application.count({ where: { paymentStatus: { not: "PAID" } } }),
    prisma.application.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: [{ email: "asc" }, { updatedAt: "desc" }],
      include: {
        nominationApplications: true,
      },
    }),
  ]);

  const uniquePaidEmails = new Set(
    paidApplications.map((application) => application.email.trim().toLowerCase()).filter(Boolean)
  );

  const report = {
    mode: apply ? "apply" : "dry-run",
    paidLegacyCount,
    unpaidLegacyCount,
    uniquePaidApplicantEmails: uniquePaidEmails.size,
    paidApplicationsWithoutNominationRows: paidApplications.filter(
      (application) => application.nominationApplications.length === 0
    ).length,
    note:
      "Unpaid/incomplete legacy applications are reported but not migrated. Run with --apply only after backup and report review.",
  };

  console.log(JSON.stringify(report, null, 2));

  if (!apply) return;

  let processed = 0;
  for (const application of paidApplications) {
    await prisma.$transaction(async (tx) => {
      const { profile } = await upsertApplicantAccountForApplication(tx, application);

      if (application.nominationApplications.length === 0) {
        await tx.nominationApplication.create({
          data: {
            applicationId: application.id,
            applicantProfileId: profile.id,
            awardId: application.awardId,
            categoryId: application.categoryId,
            status: application.status === "UNDER_REVIEW" ? "UNDER_REVIEW" : "SUBMITTED",
            paymentStatus: "PAID",
            amount: application.amount,
            currency: application.currency,
            paidAt: application.paidAt,
            submittedAt: application.submittedAt ?? application.paidAt,
            stripeCheckoutSessionId: application.stripeCheckoutSessionId,
            stripePaymentIntentId: application.stripePaymentIntentId,
          },
        });
      } else {
        await tx.nominationApplication.updateMany({
          where: { applicationId: application.id },
          data: {
            applicantProfileId: profile.id,
            paymentStatus: "PAID",
            paidAt: application.paidAt,
            submittedAt: application.submittedAt ?? application.paidAt,
          },
        });
      }
    });
    processed += 1;
  }

  console.log(JSON.stringify({ processedPaidApplications: processed }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

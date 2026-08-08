import "server-only";

import { parseNominationAnswers, parseStoredFiles } from "@/features/database/json-fields";
import { prisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";

export function getTestApplicantRecords() {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const accounts = await prisma.account.findMany({
      where: { role: "APPLICANT" },
      orderBy: { createdAt: "desc" },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
        applicantProfile: {
          include: {
            nominations: {
              orderBy: { createdAt: "asc" },
              include: {
                category: { select: { name: true } },
                award: { select: { name: true } },
                payment: { select: { status: true } },
                reviews: { select: { id: true, status: true } },
              },
            },
          },
        },
      },
    });
    return accounts.map((account) => ({
      ...account,
      applicantProfile: account.applicantProfile
        ? {
            ...account.applicantProfile,
            payments: account.payments,
            nominations: account.applicantProfile.nominations.map((nomination) => ({
              ...nomination,
              answers: parseNominationAnswers(nomination.answers).fields,
              files: parseStoredFiles(nomination.files).items,
              paymentStatus: nomination.payment.status,
            })),
          }
        : null,
    }));
  });
}

export function getTestJuryRecords() {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const [accounts, nominations] = await Promise.all([
      prisma.account.findMany({
        where: { role: "JURY" },
        orderBy: { createdAt: "desc" },
        include: {
          juryProfile: {
            include: {
              reviews: {
                orderBy: { createdAt: "desc" },
                include: {
                  nomination: {
                    include: {
                      category: { select: { name: true } },
                      award: { select: { name: true } },
                    },
                  },
                },
              },
              juryApplication: true,
            },
          },
        },
      }),
      prisma.nomination.findMany({
        where: { payment: { status: "PAID" }, status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          award: { select: { name: true } },
          applicantProfile: { select: { fullName: true } },
        },
      }),
    ]);
    return {
      accounts: accounts.map((account) => ({
        ...account,
        juryProfile: account.juryProfile
          ? { ...account.juryProfile, approvalStatus: "APPROVED" as const }
          : null,
      })),
      nominations,
    };
  });
}

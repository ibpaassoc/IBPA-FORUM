import "server-only";

import { prisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";

export function getTestApplicantRecords() {
  return runWithDataScope({ dataScope: "TEST" }, () =>
    prisma.account.findMany({
      where: { role: "APPLICANT", deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        applicantProfile: {
          include: {
            nominations: {
              where: { deletedAt: null },
              orderBy: { createdAt: "asc" },
              include: {
                category: { select: { name: true } },
                award: { select: { name: true } },
                answers: { select: { id: true } },
                files: { where: { deletedAt: null }, select: { id: true } },
                reviews: { select: { id: true, status: true } },
              },
            },
            payments: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    }),
  );
}
export function getTestJuryRecords() {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const [accounts, nominations] = await Promise.all([
      prisma.account.findMany({
        where: { role: "JURY", deletedAt: null },
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
      prisma.nominationApplication.findMany({
        where: { paymentStatus: "PAID", deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          award: { select: { name: true } },
          applicantProfile: { select: { fullName: true } },
        },
      }),
    ]);
    return { accounts, nominations };
  });
}

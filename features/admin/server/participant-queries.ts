import { prisma } from "@/shared/lib/prisma";

export async function getParticipantApplications(status?: string) {
  const activeStatus =
    status === "PAYMENT_PENDING" ||
    status === "SUBMITTED" ||
    status === "UNDER_REVIEW" ||
    status === "APPROVED" ||
    status === "REJECTED"
      ? status
      : undefined;

  const applications = await prisma.application.findMany({
    where: activeStatus
      ? {
          status: activeStatus,
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      award: true,
    },
  });

  const allApplications = await prisma.application.findMany({
    select: {
      status: true,
    },
  });

  return {
    activeStatus,
    applications,
    totals: {
      total: allApplications.length,
      paymentPending: allApplications.filter((item) => item.status === "PAYMENT_PENDING")
        .length,
      submitted: allApplications.filter((item) => item.status === "SUBMITTED").length,
      underReview: allApplications.filter((item) => item.status === "UNDER_REVIEW").length,
      approved: allApplications.filter((item) => item.status === "APPROVED").length,
    },
  };
}

export async function getParticipantApplicationDetail(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      category: true,
      award: true,
      answers: {
        orderBy: {
          createdAt: "asc",
        },
      },
      files: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

import { prisma } from "@/shared/lib/prisma";

export async function getJuryApplications() {
  const applications = await prisma.juryApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      city: true,
      country: true,
      professionalTitle: true,
      expertiseAreas: true,
      ibpaNumber: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      submittedAt: true,
      paidAt: true,
    },
  });

  return {
    applications,
    totalCount: applications.length,
    pendingCount: applications.filter((application) => application.status === "SUBMITTED")
      .length,
    approvedCount: applications.filter((application) => application.status === "APPROVED")
      .length,
    activeJudgeCount: applications.filter((application) => application.status === "PAID")
      .length,
  };
}

export async function getJuryApplicationDetail(id: string) {
  return prisma.juryApplication.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: {
          createdAt: "asc",
        },
      },
      profile: {
        select: {
          account: {
            select: {
              status: true,
              passwordHash: true,
              deletedAt: true,
            },
          },
        },
      },
    },
  });
}

import { notFound } from "next/navigation";
import type { ApplicationStatus } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { prisma } from "@/shared/lib/prisma";

export type JuryDashboardApplicationRecord = {
  id: string;
  fullName: string;
  email: string;
  city: string;
  country: string;
  status: "DRAFT" | "PAYMENT_PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
  createdAt: Date;
  category: { name: string };
  award: { name: string };
};

export async function getJuryDashboardData({
  juryApplicationId,
  expertiseAreas,
  status,
}: {
  juryApplicationId: string;
  expertiseAreas: string[];
  status?: string;
}) {
  const activeStatus: ApplicationStatus | undefined =
    status === "PAYMENT_PENDING" ||
    status === "SUBMITTED" ||
    status === "UNDER_REVIEW" ||
    status === "APPROVED" ||
    status === "REJECTED"
      ? status
      : undefined;

  const where = {
    category: {
      name: {
        in: expertiseAreas,
      },
    },
    ...(activeStatus ? { status: activeStatus } : {}),
  };

  const [juryApplication, applications, allApplications] = await Promise.all([
    prisma.juryApplication.findUnique({
      where: {
        id: juryApplicationId,
      },
      select: {
        fullName: true,
        professionalTitle: true,
        expertiseAreas: true,
      },
    }),
    prisma.application.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        city: true,
        country: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        award: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.application.findMany({
      where: {
        category: {
          name: {
            in: expertiseAreas,
          },
        },
      },
      select: {
        status: true,
      },
    }),
  ]);

  if (!juryApplication) {
    notFound();
  }

  const dashboardApplications: JuryDashboardApplicationRecord[] = applications.map(
    (application) => ({
      id: application.id,
      fullName: application.fullName,
      email: application.email,
      city: application.city,
      country: application.country,
      status: application.status,
      paymentStatus: application.paymentStatus,
      createdAt: application.createdAt,
      category: {
        name: application.category.name,
      },
      award: {
        name: application.award.name,
      },
    })
  );

  return {
    juryApplication,
    activeStatus,
    applications: dashboardApplications,
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

export async function getJuryDashboardApplicationDetail({
  applicationId,
  expertiseAreas,
}: {
  applicationId: string;
  expertiseAreas: string[];
}) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      category: {
        name: {
          in: expertiseAreas,
        },
      },
    },
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

  if (!application) {
    notFound();
  }

  return {
    application,
    categoryFields: categoryFieldConfigs[application.category.slug] ?? [],
  };
}

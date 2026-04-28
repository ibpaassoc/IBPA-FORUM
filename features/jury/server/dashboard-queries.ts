import { notFound } from "next/navigation";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { prisma } from "@/shared/lib/prisma";

export type JuryDashboardApplicationRecord = {
  id: string;
  fullName: string;
  email: string;
  city: string;
  country: string;
  createdAt: Date;
  category: { name: string };
  award: { name: string };
};

export async function getJuryDashboardData({
  juryApplicationId,
  expertiseAreas,
  category,
}: {
  juryApplicationId: string;
  expertiseAreas: string[];
  category?: string;
}) {
  const activeCategory =
    category && expertiseAreas.includes(category) ? category : undefined;

  const where = {
    category: activeCategory
      ? {
          name: activeCategory,
        }
      : {
          name: {
            in: expertiseAreas,
          },
        },
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
        category: {
          select: {
            name: true,
          },
        },
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
    activeCategory,
    applications: dashboardApplications,
    totals: {
      total: allApplications.length,
      categories: expertiseAreas.length,
      byCategory: expertiseAreas.map((area) => ({
        name: area,
        count: allApplications.filter((item) => item.category.name === area).length,
      })),
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

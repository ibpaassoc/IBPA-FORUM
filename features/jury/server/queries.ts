import { prisma } from "@/shared/lib/prisma";

export async function getPublicJuryMembers() {
  try {
    return await prisma.juryApplication.findMany({
      where: {
        status: "PAID",
        paymentStatus: "PAID",
      },
      orderBy: {
        paidAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        professionalTitle: true,
        city: true,
        country: true,
        expertiseAreas: true,
        professionalBio: true,
        files: {
          where: {
            fieldKey: "profilePhoto",
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });
  } catch (error) {
    console.warn("Failed to load public jury members.", error);
    return [];
  }
}

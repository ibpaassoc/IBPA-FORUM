import { prisma } from "@/shared/lib/prisma";

export async function getPublicJuryMembers() {
  try {
    const members = await prisma.juryApplication.findMany({
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

    return members.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      professionalTitle: member.professionalTitle,
      city: member.city,
      country: member.country,
      expertise: member.expertiseAreas,
      bio: member.professionalBio,
      profilePhotoFileId: member.files[0]?.id ?? null,
    }));
  } catch (error) {
    console.warn("Failed to load public jury members.", error);
    return [];
  }
}

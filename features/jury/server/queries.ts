import { unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { resolveJuryPhotoSrc } from "@/features/jury/lib/profile-photo";

async function readPublicJuryMembersFromDb() {
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
            storageKey: true,
          },
          take: 1,
        },
      },
    });

    return members.map((member) => {
      const photo = member.files[0];
      return {
        id: member.id,
        fullName: member.fullName,
        professionalTitle: member.professionalTitle,
        city: member.city,
        country: member.country,
        expertise: member.expertiseAreas,
        bio: member.professionalBio,
        profilePhotoSrc: resolveJuryPhotoSrc(photo?.id, photo?.storageKey),
      };
    });
  } catch (error) {
    console.warn("Failed to load public jury members.", error);
    return [];
  }
}

const getCachedPublicJuryMembers = unstable_cache(
  async () => readPublicJuryMembersFromDb(),
  ["public-jury-members"],
  {
    revalidate: 60 * 10,
  }
);

export async function getPublicJuryMembers() {
  return getCachedPublicJuryMembers();
}

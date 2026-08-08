import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { resolveJuryPhotoSrc } from "@/features/jury/lib/profile-photo";
import { parseStoredFiles } from "@/features/database/json-fields";

// Cache tag shared by the public jury listing and the mutations that change it.
// Any write that alters who appears on /jury (or their photo) must invalidate it.
export const PUBLIC_JURY_MEMBERS_TAG = "public-jury-members";

/**
 * Invalidate the cached public jury listing and the /jury route so an admin
 * photo swap or a new paid member shows up on the next visit — without waiting
 * for the timed revalidation window. Safe to call from route handlers and the
 * Stripe webhook (Next 16 requires the `{ expire: 0 }` form there for an
 * immediate, non–stale-while-revalidate expiry).
 */
export function revalidatePublicJuryMembers() {
  revalidateTag(PUBLIC_JURY_MEMBERS_TAG, { expire: 0 });
  revalidatePath("/jury");
}

async function readPublicJuryMembersFromDb() {
  try {
    const members = await prisma.juryProfile.findMany({
      where: {
        juryApplication: {
          status: "PAID",
          payments: { some: { status: "PAID" } },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        professionalTitle: true,
        city: true,
        country: true,
        approvedCategories: true,
        professionalBio: true,
        juryApplication: { select: { files: true } },
      },
    });

    return members.map((member) => {
      const photo = parseStoredFiles(member.juryApplication.files).items.find(
        (file) => file.fieldId === "profilePhoto"
      );
      return {
        id: member.id,
        fullName: member.fullName,
        professionalTitle: member.professionalTitle,
        city: member.city,
        country: member.country,
        expertise: member.approvedCategories,
        bio: member.professionalBio,
        profilePhotoSrc: resolveJuryPhotoSrc(photo?.id, photo?.blobKey ?? null),
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
    tags: [PUBLIC_JURY_MEMBERS_TAG],
    revalidate: 60 * 10,
  }
);

export async function getPublicJuryMembers() {
  return getCachedPublicJuryMembers();
}

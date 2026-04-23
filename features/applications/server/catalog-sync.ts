import { categoryCatalog } from "@/features/applications/config/category-catalog";
import { prisma } from "@/shared/lib/prisma";

export async function syncApplicationCatalog() {
  for (const definition of categoryCatalog) {
    const category = await prisma.category.upsert({
      where: {
        slug: definition.slug,
      },
      update: {
        name: definition.name,
      },
      create: {
        name: definition.name,
        slug: definition.slug,
      },
    });

    await reconcileCategoryAwards(category.id, definition.awards);
  }
}

async function ensureAward(categoryId: string, name: string) {
  const existing = await prisma.award.findFirst({
    where: {
      categoryId,
      name,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.award.create({
    data: {
      categoryId,
      name,
    },
  });
}

async function moveApplicationsToAward(fromAwardId: string, toAwardId: string) {
  if (fromAwardId === toAwardId) {
    return;
  }

  await prisma.application.updateMany({
    where: {
      awardId: fromAwardId,
    },
    data: {
      awardId: toAwardId,
    },
  });
}

async function reconcileCategoryAwards(
  categoryId: string,
  desiredAwardNames: string[]
) {
  const desiredNameSet = new Set(desiredAwardNames);

  const awards = await prisma.award.findMany({
    where: {
      categoryId,
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const awardsByName = new Map<string, typeof awards>();
  for (const award of awards) {
    const group = awardsByName.get(award.name) ?? [];
    group.push(award);
    awardsByName.set(award.name, group);
  }

  for (const desiredName of desiredAwardNames) {
    const duplicates = awardsByName.get(desiredName) ?? [];
    const canonical =
      duplicates.sort(
        (left, right) => right._count.applications - left._count.applications
      )[0] ?? (await ensureAward(categoryId, desiredName));

    const redundant = duplicates.filter((award) => award.id !== canonical.id);
    for (const duplicate of redundant) {
      await moveApplicationsToAward(duplicate.id, canonical.id);
      await prisma.award.deleteMany({
        where: {
          id: duplicate.id,
        },
      });
    }
  }

  const refreshedAwards = await prisma.award.findMany({
    where: {
      categoryId,
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  for (const award of refreshedAwards) {
    if (desiredNameSet.has(award.name)) {
      continue;
    }

    if (award._count.applications === 0) {
      await prisma.award.deleteMany({
        where: {
          id: award.id,
        },
      });
    }
  }
}

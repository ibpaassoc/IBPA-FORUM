import "server-only";

import type { Regulation } from "@prisma/client";
import type {
  AdminRegulationItem,
  RegulationKey,
  RegulationLanguage,
  RegulationUrls,
} from "@/features/regulations/types";
import {
  regulationAvailability,
  resolveRegulationLanguage,
} from "@/features/regulations/types";
import { prisma } from "@/shared/lib/prisma";

export const regulationUrlField = {
  en: "enUrl",
  ru: "ruUrl",
  ua: "uaUrl",
} as const satisfies Record<RegulationLanguage, keyof Regulation>;

export function regulationUrls(
  regulation: Pick<Regulation, "enUrl" | "ruUrl" | "uaUrl"> | null,
): RegulationUrls {
  return {
    en: regulation?.enUrl ?? null,
    ru: regulation?.ruUrl ?? null,
    ua: regulation?.uaUrl ?? null,
  };
}

export async function getRegulationsForAdmin(): Promise<{
  general: AdminRegulationItem;
  categories: AdminRegulationItem[];
}> {
  const [generalRecord, categories] = await Promise.all([
    prisma.regulation.findUnique({ where: { key: "general" } }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        regulation: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    general: {
      key: "general",
      categoryId: null,
      title: "Общие положения",
      storageScope: "general",
      availability: regulationAvailability(regulationUrls(generalRecord)),
    },
    categories: categories.map((category) => ({
      key: `category:${category.id}`,
      categoryId: category.id,
      title: category.name,
      storageScope: category.slug,
      availability: regulationAvailability(regulationUrls(category.regulation)),
    })),
  };
}

export async function resolveRegulationUrl({
  key,
  language,
  exact = false,
}: {
  key: RegulationKey;
  language: RegulationLanguage;
  exact?: boolean;
}) {
  const regulation = await prisma.regulation.findUnique({ where: { key } });
  const urls = regulationUrls(regulation);
  const resolvedLanguage = exact
    ? urls[language]
      ? language
      : null
    : resolveRegulationLanguage(regulationAvailability(urls), language);

  if (!resolvedLanguage) return null;

  return {
    language: resolvedLanguage,
    url: urls[resolvedLanguage] as string,
  };
}

export async function getExpectedRegulationTarget({
  key,
  categoryId,
}: {
  key: RegulationKey;
  categoryId: string | null;
}) {
  if (key === "general") {
    return categoryId === null
      ? { key, categoryId: null, storageScope: "general" }
      : null;
  }

  if (!categoryId || key !== `category:${categoryId}`) return null;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, slug: true },
  });

  return category
    ? { key, categoryId: category.id, storageScope: category.slug }
    : null;
}

export async function setRegulationUrl({
  key,
  categoryId,
  language,
  url,
}: {
  key: RegulationKey;
  categoryId: string | null;
  language: RegulationLanguage;
  url: string | null;
}) {
  const field = regulationUrlField[language];

  return prisma.regulation.upsert({
    where: { key },
    create: {
      key,
      categoryId,
      [field]: url,
    },
    update: {
      [field]: url,
    },
  });
}

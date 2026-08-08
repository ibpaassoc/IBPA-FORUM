import "server-only";
import { Prisma } from "@prisma/client";

import { regulationsSettingSchema } from "@/features/database/json-fields";
import type {
  AdminRegulationItem,
  RegulationKey,
  RegulationLanguage,
  RegulationUrls,
  PublicRegulations,
} from "@/features/regulations/types";
import {
  regulationAvailability,
  resolveRegulationLanguage,
} from "@/features/regulations/types";
import { prisma } from "@/shared/lib/prisma";

type RegulationsSetting = ReturnType<typeof regulationsSettingSchema.parse>;

function emptyRegulations(): RegulationsSetting {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    general: { en: {}, ru: {}, ua: {} },
    categories: {},
  };
}

async function getSetting() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "regulations" } });
  if (!setting) return emptyRegulations();
  return regulationsSettingSchema.parse(setting.value);
}

function urlFromLanguage(value: Record<string, unknown> | undefined) {
  return typeof value?.url === "string" && value.url.length > 0 ? value.url : null;
}

export function regulationUrls(
  regulation:
    | { en?: Record<string, unknown>; ru?: Record<string, unknown>; ua?: Record<string, unknown> }
    | null
): RegulationUrls {
  return {
    en: urlFromLanguage(regulation?.en),
    ru: urlFromLanguage(regulation?.ru),
    ua: urlFromLanguage(regulation?.ua),
  };
}

export async function getRegulationsForAdmin(): Promise<{
  general: AdminRegulationItem;
  categories: AdminRegulationItem[];
}> {
  const [setting, categories] = await Promise.all([
    getSetting(),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return {
    general: {
      key: "general",
      categoryId: null,
      title: "Общий регламент",
      storageScope: "general",
      availability: regulationAvailability(regulationUrls(setting.general)),
    },
    categories: categories.map((category) => ({
      key: `category:${category.id}`,
      categoryId: category.id,
      title: category.name,
      storageScope: category.slug,
      availability: regulationAvailability(regulationUrls(setting.categories[category.id] ?? null)),
    })),
  };
}

export async function getPublicRegulations(): Promise<PublicRegulations> {
  const setting = await getSetting();
  return {
    general: regulationAvailability(regulationUrls(setting.general)),
    categories: Object.fromEntries(
      Object.entries(setting.categories).map(([categoryId, value]) => [
        categoryId,
        regulationAvailability(regulationUrls(value)),
      ])
    ),
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
  const setting = await getSetting();
  const record = key === "general" ? setting.general : setting.categories[key.slice("category:".length)];
  const urls = regulationUrls(record ?? null);
  const resolvedLanguage = exact
    ? urls[language]
      ? language
      : null
    : resolveRegulationLanguage(regulationAvailability(urls), language);
  return resolvedLanguage ? { language: resolvedLanguage, url: urls[resolvedLanguage] as string } : null;
}

export async function getExpectedRegulationTarget({
  key,
  categoryId,
}: {
  key: RegulationKey;
  categoryId: string | null;
}) {
  if (key === "general") return categoryId === null ? { key, categoryId: null, storageScope: "general" } : null;
  if (!categoryId || key !== `category:${categoryId}`) return null;
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, slug: true } });
  return category ? { key, categoryId: category.id, storageScope: category.slug } : null;
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
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('forum:site-setting:regulations'))`;
    const current = await tx.siteSetting.findUnique({ where: { key: "regulations" } });
    const setting = current ? regulationsSettingSchema.parse(current.value) : emptyRegulations();
    const now = new Date().toISOString();
    if (key === "general") {
      setting.general = {
        ...setting.general,
        [language]: { ...setting.general[language], url },
      };
    } else {
      if (!categoryId) throw new Error("A category is required for a category regulation.");
      const record = setting.categories[categoryId] ?? { en: {}, ru: {}, ua: {} };
      setting.categories = {
        ...setting.categories,
        [categoryId]: { ...record, [language]: { ...record[language], url } },
      };
    }
    setting.updatedAt = now;
    await tx.siteSetting.upsert({
      where: { key: "regulations" },
      create: { key: "regulations", value: setting as unknown as Prisma.InputJsonValue },
      update: { value: setting as unknown as Prisma.InputJsonValue },
    });
    return setting;
  });
}

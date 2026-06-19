import "server-only";
import { prisma } from "@/shared/lib/prisma";

export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch (e: any) {
    // Table may not exist yet if migration hasn't run
    if (e?.code === "P2021") return null;
    throw e;
  }
}

export async function getSiteSettingBool(key: string): Promise<boolean> {
  const value = await getSiteSetting(key);
  return value === "true";
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

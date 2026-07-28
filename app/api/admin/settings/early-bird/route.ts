import { NextResponse } from "next/server";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  await requireAdmin();
  const enabled = await getSiteSettingBool("earlyBirdEnabled");
  return NextResponse.json({ enabled });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const enabled = Boolean(body.enabled);
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "earlyBirdEnabled" },
      update: { value: String(enabled) },
      create: { key: "earlyBirdEnabled", value: String(enabled) },
    }),
    ...(enabled
      ? [
          prisma.siteSetting.upsert({
            where: { key: "permanentTickets30Enabled" },
            update: { value: "false" },
            create: { key: "permanentTickets30Enabled", value: "false" },
          }),
        ]
      : []),
  ]);
  return NextResponse.json({ enabled });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";

const schema = z.object({
  kind: z.enum(["earlyBird", "permanent30"]),
  enabled: z.boolean(),
});

const settingKey = {
  earlyBird: "earlyBirdEnabled",
  permanent30: "permanentTickets30Enabled",
} as const;

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid ticket discount setting." }, { status: 400 });
  }

  const { kind, enabled } = parsed.data;
  const otherKind = kind === "earlyBird" ? "permanent30" : "earlyBird";

  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: settingKey[kind] },
      update: { value: String(enabled) },
      create: { key: settingKey[kind], value: String(enabled) },
    }),
    ...(enabled
      ? [
          prisma.siteSetting.upsert({
            where: { key: settingKey[otherKind] },
            update: { value: "false" },
            create: { key: settingKey[otherKind], value: "false" },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({
    earlyBirdEnabled: kind === "earlyBird" ? enabled : false,
    permanent30Enabled: kind === "permanent30" ? enabled : false,
  });
}

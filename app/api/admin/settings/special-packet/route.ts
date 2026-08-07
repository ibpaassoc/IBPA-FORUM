import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { setSiteSetting } from "@/features/settings/server/site-settings";
import { SPECIAL_PACKET_SETTING_KEY } from "@/features/tickets/server/special-packet";

const schema = z.object({ enabled: z.boolean() });

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid Special Packet setting." }, { status: 400 });
  }

  await setSiteSetting(SPECIAL_PACKET_SETTING_KEY, String(parsed.data.enabled));
  return NextResponse.json({ enabled: parsed.data.enabled });
}

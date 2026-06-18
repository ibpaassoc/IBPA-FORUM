import { NextResponse } from "next/server";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { getSiteSettingBool, setSiteSetting } from "@/features/settings/server/site-settings";

export async function GET() {
  await requireAdmin();
  const enabled = await getSiteSettingBool("earlyBirdEnabled");
  return NextResponse.json({ enabled });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const enabled = Boolean(body.enabled);
  await setSiteSetting("earlyBirdEnabled", String(enabled));
  return NextResponse.json({ enabled });
}

import "server-only";

import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { requireEnv } from "@/lib/env";
import type { SpecialPacketStatus } from "@/features/tickets/types";

export const SPECIAL_PACKET_SETTING_KEY = "specialPacketEnabled";

export async function isSpecialPacketEnabled() {
  return getSiteSettingBool(SPECIAL_PACKET_SETTING_KEY);
}

export function getSpecialPacketPriceId(isIbpaMember: boolean) {
  return requireEnv([
    isIbpaMember ? "SPECIAL_PACKET_MEMBER" : "SPECIAL_PACKET_NON_MEMBER",
  ]);
}

export async function getSpecialPacketStatus(): Promise<SpecialPacketStatus> {
  return { enabled: await isSpecialPacketEnabled() };
}

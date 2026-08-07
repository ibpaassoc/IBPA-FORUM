import "server-only";

import { PRICING } from "@/data/pricing";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { getStripe } from "@/features/payments/server/stripe-client";
import { readEnv, requireEnv } from "@/lib/env";
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

function formatPrice(amountCents: number | null, currency = "usd") {
  if (amountCents === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

async function retrieveFormattedPrice(envName: string) {
  const priceId = readEnv([envName]);
  if (!priceId) return null;

  try {
    const price = await getStripe().prices.retrieve(priceId);
    return formatPrice(price.unit_amount, price.currency);
  } catch {
    return null;
  }
}

export async function getSpecialPacketStatus(): Promise<SpecialPacketStatus> {
  const [enabled, memberPrice, standardPrice] = await Promise.all([
    isSpecialPacketEnabled(),
    retrieveFormattedPrice("SPECIAL_PACKET_MEMBER"),
    retrieveFormattedPrice("SPECIAL_PACKET_NON_MEMBER"),
  ]);

  return {
    enabled,
    memberPrice: memberPrice ?? PRICING.forumTickets.specialPacket.ibpaMembers,
    standardPrice: standardPrice ?? PRICING.forumTickets.specialPacket.standard,
  };
}

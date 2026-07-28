import "server-only";

import { readEnv } from "@/lib/env";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { getStripe } from "@/features/payments/server/stripe-client";
import type {
  TicketDiscount,
  TicketDiscountKind,
  TicketDiscountStatus,
} from "@/features/tickets/types";

const DISCOUNT_CONFIG: Record<TicketDiscountKind, { settingKey: string; envName: string }> = {
  earlyBird: {
    settingKey: "earlyBirdEnabled",
    envName: "STRIPE_EARLY_BIRD_COUPON",
  },
  permanent30: {
    settingKey: "permanentTickets30Enabled",
    envName: "STRIPE_PERM_TICKETS30_DISCOUNT_ID",
  },
};

export type ActiveTicketDiscount = {
  kind: TicketDiscountKind;
  discount: Exclude<TicketDiscount, null>;
} | null;

async function resolveCouponDiscount(envName: string): Promise<TicketDiscount> {
  const couponId = readEnv([envName]);
  if (!couponId) return null;

  try {
    const coupon = await getStripe().coupons.retrieve(couponId);
    if (coupon.percent_off) return { type: "percent", value: coupon.percent_off };
    if (coupon.amount_off && coupon.currency) {
      return { type: "amount", value: coupon.amount_off, currency: coupon.currency };
    }
  } catch {
    // An unavailable Stripe coupon must never block ticket checkout.
  }

  return null;
}

/**
 * Returns the single enabled automatic ticket discount. Admin settings enforce
 * mutual exclusion; the early-bird fallback also protects existing deployments
 * that may briefly contain both values during a rollout.
 */
export async function getActiveTicketDiscount(): Promise<ActiveTicketDiscount> {
  const [earlyBirdEnabled, permanent30Enabled] = await Promise.all([
    getSiteSettingBool(DISCOUNT_CONFIG.earlyBird.settingKey),
    getSiteSettingBool(DISCOUNT_CONFIG.permanent30.settingKey),
  ]);

  const kind = earlyBirdEnabled
    ? "earlyBird"
    : permanent30Enabled
      ? "permanent30"
      : null;
  if (!kind) return null;

  const discount = await resolveCouponDiscount(DISCOUNT_CONFIG[kind].envName);
  return discount ? { kind, discount } : null;
}

export async function getTicketDiscountStatus(): Promise<TicketDiscountStatus> {
  const active = await getActiveTicketDiscount();
  return active
    ? { enabled: true, kind: active.kind, discount: active.discount }
    : { enabled: false, kind: null, discount: null };
}

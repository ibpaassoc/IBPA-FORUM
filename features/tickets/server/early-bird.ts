import "server-only";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { getStripe } from "@/features/payments/server/stripe-client";
import { readEnv } from "@/lib/env";
import type { EarlyBirdDiscount } from "@/features/tickets/types";

/**
 * Resolve the currently-active early-bird discount, or null when it is disabled
 * or not configured. Shared by the public checkout and the admin resend flow so
 * both price a ticket identically. Any Stripe error degrades safely to null
 * (no discount) rather than blocking a purchase.
 */
export async function getEarlyBirdDiscount(): Promise<EarlyBirdDiscount> {
  const enabled = await getSiteSettingBool("earlyBirdEnabled");
  if (!enabled) return null;

  const couponId = readEnv(["STRIPE_EARLY_BIRD_COUPON"]);
  if (!couponId) return null;

  try {
    const stripe = getStripe();
    const coupon = await stripe.coupons.retrieve(couponId);
    if (coupon.percent_off) {
      return { type: "percent", value: coupon.percent_off };
    }
    if (coupon.amount_off && coupon.currency) {
      return { type: "amount", value: coupon.amount_off, currency: coupon.currency };
    }
    return null;
  } catch {
    return null;
  }
}

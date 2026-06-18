import { NextResponse } from "next/server";
import { getSiteSettingBool } from "@/features/settings/server/site-settings";
import { getStripe } from "@/features/payments/server/stripe-client";
import { readEnv } from "@/lib/env";
import type { EarlyBirdStatus } from "@/features/tickets/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = await getSiteSettingBool("earlyBirdEnabled");

  if (!enabled) {
    return NextResponse.json({ enabled: false, discount: null } satisfies EarlyBirdStatus);
  }

  const couponId = readEnv(["STRIPE_EARLY_BIRD_COUPON"]);
  if (!couponId) {
    return NextResponse.json({ enabled: false, discount: null } satisfies EarlyBirdStatus);
  }

  try {
    const stripe = getStripe();
    const coupon = await stripe.coupons.retrieve(couponId);

    const discount = coupon.percent_off
      ? { type: "percent" as const, value: coupon.percent_off }
      : coupon.amount_off && coupon.currency
        ? { type: "amount" as const, value: coupon.amount_off, currency: coupon.currency }
        : null;

    return NextResponse.json({ enabled: true, discount } satisfies EarlyBirdStatus);
  } catch {
    return NextResponse.json({ enabled: false, discount: null } satisfies EarlyBirdStatus);
  }
}

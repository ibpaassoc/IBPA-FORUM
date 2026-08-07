import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/features/payments/server/stripe-client";
import type { StripeAmount, StripePricingSnapshot } from "@/features/pricing/types";
import type { TicketPriceConfig } from "@/features/tickets/lib/pricing";
import { readEnv } from "@/lib/env";

async function retrievePrice(envName: string): Promise<StripeAmount | null> {
  const priceId = readEnv([envName]);
  if (!priceId) return null;

  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (!price.active || price.unit_amount === null) return null;
    return { amountCents: price.unit_amount, currency: price.currency };
  } catch {
    return null;
  }
}

async function retrieveCoupon(envName: string): Promise<Stripe.Coupon | null> {
  const couponId = readEnv([envName]);
  if (!couponId) return null;

  try {
    const coupon = await getStripe().coupons.retrieve(couponId);
    return coupon.valid ? coupon : null;
  } catch {
    return null;
  }
}

function packagePrice(unit: StripeAmount | null, quantity: number, coupon: Stripe.Coupon | null): StripeAmount | null {
  if (!unit || !coupon) return null;
  const subtotal = unit.amountCents * quantity;

  if (coupon.percent_off !== null) {
    return {
      amountCents: Math.round(subtotal * (1 - coupon.percent_off / 100)),
      currency: unit.currency,
    };
  }

  if (coupon.amount_off !== null && coupon.currency === unit.currency) {
    return {
      amountCents: Math.max(0, subtotal - coupon.amount_off),
      currency: unit.currency,
    };
  }

  return null;
}

export async function getPublicStripePricing(): Promise<StripePricingSnapshot> {
  const [
    oneDayStandard,
    twoDaysStandard,
    oneDayMember,
    twoDaysMember,
    galaDinner,
    specialStandard,
    specialMember,
    applicationStandard,
    applicationMember,
    threeNominationCoupon,
    fiveNominationCoupon,
    juryStandard,
    juryMember,
  ] = await Promise.all([
    retrievePrice("ONE_DAY_NON_MEMBER"),
    retrievePrice("TWO_DAYS_NON_MEMBER"),
    retrievePrice("ONE_DAY_MEMBER"),
    retrievePrice("TWO_DAYS_MEMBER"),
    retrievePrice("GALA_DINNER"),
    retrievePrice("SPECIAL_PACKET_NON_MEMBER"),
    retrievePrice("SPECIAL_PACKET_MEMBER"),
    retrievePrice("APPLY_NON_IBPA_PRICE"),
    retrievePrice("APPLY_IBPA_PRICE"),
    retrieveCoupon("THREE_NOMINATIONS_DISCOUNT"),
    retrieveCoupon("FIVE_NOMINATIONS_DISCOUNT"),
    retrievePrice("JURY_NON_IBPA_PRICE"),
    retrievePrice("JURY_IBPA_PRICE"),
  ]);

  return {
    forumTickets: {
      standard: { oneDay: oneDayStandard, twoDays: twoDaysStandard },
      ibpaMembers: { oneDay: oneDayMember, twoDays: twoDaysMember },
      galaDinner,
      specialPacket: { ibpaMembers: specialMember, standard: specialStandard },
    },
    awardParticipation: {
      ibpaMembers: {
        oneNomination: applicationMember,
        threeNominations: packagePrice(applicationMember, 3, threeNominationCoupon),
        fiveNominations: packagePrice(applicationMember, 5, fiveNominationCoupon),
      },
      nonMembers: {
        oneNomination: applicationStandard,
        threeNominations: packagePrice(applicationStandard, 3, threeNominationCoupon),
        fiveNominations: packagePrice(applicationStandard, 5, fiveNominationCoupon),
      },
    },
    judgeRegistration: { ibpaMembers: juryMember, standard: juryStandard },
  };
}

export async function getTicketPriceConfigFromStripe(): Promise<TicketPriceConfig> {
  const [oneDayStandard, twoDaysStandard, oneDayMember, twoDaysMember, galaDinner] = await Promise.all([
    retrievePrice("ONE_DAY_NON_MEMBER"),
    retrievePrice("TWO_DAYS_NON_MEMBER"),
    retrievePrice("ONE_DAY_MEMBER"),
    retrievePrice("TWO_DAYS_MEMBER"),
    retrievePrice("GALA_DINNER"),
  ]);

  if (!oneDayStandard || !twoDaysStandard || !oneDayMember || !twoDaysMember || !galaDinner) {
    throw new Error("Required Stripe ticket prices are missing, inactive, or invalid.");
  }

  const currencies = new Set([
    oneDayStandard.currency,
    twoDaysStandard.currency,
    oneDayMember.currency,
    twoDaysMember.currency,
    galaDinner.currency,
  ]);
  if (currencies.size !== 1) {
    throw new Error("Stripe ticket prices must use the same currency.");
  }

  return {
    ticketAmountsCents: {
      ONE_DAY: { ibpa: oneDayMember.amountCents, standard: oneDayStandard.amountCents },
      TWO_DAYS: { ibpa: twoDaysMember.amountCents, standard: twoDaysStandard.amountCents },
    },
    galaDinnerCents: galaDinner.amountCents,
  };
}

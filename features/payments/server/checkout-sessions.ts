import { requireEnv } from "@/lib/env";
import { getAppUrl, getStripe } from "@/features/payments/server/stripe-client";

function getJuryPriceId(isIbpaMember: boolean) {
  return requireEnv([isIbpaMember ? "JURY_IBPA_PRICE" : "JURY_NON_IBPA_PRICE"]);
}

export async function createJuryCheckoutSession({
  juryApplicationId,
  email,
  isIbpaMember,
}: {
  juryApplicationId: string;
  email: string;
  isIbpaMember: boolean;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const priceId = getJuryPriceId(isIbpaMember);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/jury/register?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/jury`,
    metadata: {
      juryApplicationId,
      email,
    },
    payment_intent_data: {
      metadata: {
        juryApplicationId,
        email,
      },
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  return {
    id: session.id,
    url: session.url,
  };
}

function getCompetitorPriceId(isIbpaMember: boolean): string {
  return requireEnv([isIbpaMember ? "APPLY_IBPA_PRICE" : "APPLY_NON_IBPA_PRICE"]);
}

function getCompetitorCouponId(nominationCount: number): string | null {
  if (nominationCount >= 5) {
    return process.env["FIVE_NOMINATIONS_DSICOUNT"] ?? null;
  }
  if (nominationCount >= 3) {
    return process.env["THREE_NOMINATIONS_DISCOUNT"] ?? null;
  }
  return null;
}

export async function createCompetitorCheckoutSession({
  applicationId,
  email,
  categoryId,
  awardId,
  nominationCount,
  isIbpaMember,
}: {
  applicationId: string;
  email: string;
  categoryId: string;
  awardId: string;
  nominationCount: number;
  isIbpaMember: boolean;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const safeCount = Math.max(1, nominationCount);
  const priceId = getCompetitorPriceId(isIbpaMember);
  const couponId = getCompetitorCouponId(safeCount);

  const metadata = {
    flowType: "competitor",
    applicationId,
    applicantEmail: email,
    categoryId,
    awardId,
    nominationCount: String(safeCount),
    isIbpaMember: String(isIbpaMember),
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/apply/cancel?application_id=${applicationId}`,
    metadata,
    payment_intent_data: { metadata },
    line_items: [
      {
        price: priceId,
        quantity: safeCount,
      },
    ],
    ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  return {
    id: session.id,
    url: session.url,
  };
}

export async function createApplicantNominationCheckoutSession({
  paymentId,
  email,
  originalAmountCents,
  finalAmountCents,
  currency = "usd",
  nominationCount,
  promoDiscountId,
}: {
  paymentId: string;
  email: string;
  originalAmountCents: number;
  finalAmountCents: number;
  currency?: "usd";
  nominationCount: number;
  promoDiscountId?: string | null;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const safeCount = Math.max(1, nominationCount);
  const metadata = {
    flowType: "applicant_nomination_purchase",
    paymentId,
    nominationCount: String(safeCount),
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/apply/cancel?payment_id=${encodeURIComponent(paymentId)}`,
    metadata,
    payment_intent_data: { metadata },
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: originalAmountCents,
          product_data: {
            name:
              safeCount === 1
                ? "IBPA Beauty Award nomination"
                : `IBPA Beauty Award nominations (${safeCount})`,
          },
        },
        quantity: 1,
      },
    ],
    ...(promoDiscountId ? { discounts: [{ coupon: promoDiscountId }] } : {}),
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  if (promoDiscountId && session.amount_total !== null && session.amount_total !== finalAmountCents) {
    console.warn("Stripe Checkout session amount differs from calculated promo total.", {
      paymentId,
      expectedAmountCents: finalAmountCents,
      stripeAmountCents: session.amount_total,
    });
  }

  return {
    id: session.id,
    url: session.url,
  };
}

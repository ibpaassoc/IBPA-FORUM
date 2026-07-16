import "server-only";
import { getAppUrl, getStripe } from "@/features/payments/server/stripe-client";
import { requireEnv } from "@/lib/env";
import type { TicketType } from "@prisma/client";
import type { Language } from "@/lib/i18n/translations";
import { buildTicketCheckoutMetadata } from "@/features/tickets/lib/checkout-metadata";

// Stripe Checkout Sessions may live at most 24h. We set this explicitly (rather
// than leaning on the default) so both the initial purchase and an admin-resent
// link have a well-defined, valid expiration and callers never assume a session
// stays payable forever.
const CHECKOUT_SESSION_TTL_SECONDS = 24 * 60 * 60;

function getTicketPriceId(type: TicketType, isIbpaMember: boolean): string {
  if (type === "ONE_DAY") {
    return requireEnv([isIbpaMember ? "ONE_DAY_MEMBER" : "ONE_DAY_NON_MEMBER"]);
  }
  return requireEnv([isIbpaMember ? "TWO_DAYS_MEMBER" : "TWO_DAYS_NON_MEMBER"]);
}

function getGalaDinnerPriceId(): string {
  return requireEnv(["GALA_DINNER"]);
}

function ticketLabel(type: TicketType, earlyBird: boolean): string {
  const base = type === "ONE_DAY" ? "1-Day Forum Pass" : "2-Day Forum Pass";
  return earlyBird ? `${base} — Early Bird` : base;
}

export async function createTicketCheckoutSession({
  ticketId,
  email,
  type,
  galaDinner,
  isIbpaMember,
  earlyBirdDiscountedAmountCents,
  locale,
  promoDiscountId,
}: {
  ticketId: string;
  email: string;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  earlyBirdDiscountedAmountCents: number | null;
  locale: Language;
  promoDiscountId?: string | null;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const isEarlyBird = earlyBirdDiscountedAmountCents !== null;

  const forumPassLineItem = isEarlyBird
    ? {
        price_data: {
          currency: "usd",
          unit_amount: earlyBirdDiscountedAmountCents,
          product_data: { name: ticketLabel(type, true) },
        },
        quantity: 1,
      }
    : { price: getTicketPriceId(type, isIbpaMember), quantity: 1 };

  const lineItems: (
    | { price: string; quantity: number }
    | { price_data: { currency: string; unit_amount: number; product_data: { name: string } }; quantity: number }
  )[] = [forumPassLineItem];

  if (galaDinner) {
    lineItems.push({ price: getGalaDinnerPriceId(), quantity: 1 });
  }

  const metadata = buildTicketCheckoutMetadata({
    ticketId,
    email,
    type,
    galaDinner,
    locale,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/#pricing`,
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
    metadata,
    payment_intent_data: { metadata },
    line_items: lineItems,
    ...(promoDiscountId ? { discounts: [{ coupon: promoDiscountId }] } : {}),
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  return { id: session.id, url: session.url, amountTotalCents: session.amount_total };
}

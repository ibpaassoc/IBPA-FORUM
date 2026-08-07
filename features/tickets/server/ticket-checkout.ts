import "server-only";
import { getAppUrl, getStripe } from "@/features/payments/server/stripe-client";
import { requireEnv } from "@/lib/env";
import type { TicketType } from "@prisma/client";
import type { Language } from "@/lib/i18n/translations";
import {
  buildSpecialPacketCheckoutMetadata,
  buildTicketCheckoutMetadata,
} from "@/features/tickets/lib/checkout-metadata";
import { getSpecialPacketPriceId } from "@/features/tickets/server/special-packet";

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

export async function createSpecialPacketCheckoutSession({
  ticketIds,
  email,
  isIbpaMember,
  locale,
}: {
  ticketIds: [string, string];
  email: string;
  isIbpaMember: boolean;
  locale: Language;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const metadata = buildSpecialPacketCheckoutMetadata({ ticketIds, email, locale });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/#pricing`,
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
    metadata,
    payment_intent_data: { metadata },
    line_items: [
      { price: getSpecialPacketPriceId(isIbpaMember), quantity: 1 },
    ],
  });

  if (!session.url || session.amount_total === null) {
    throw new Error("Stripe Special Packet checkout is missing a URL or total.");
  }

  return { id: session.id, url: session.url, amountTotalCents: session.amount_total };
}

function getGalaDinnerPriceId(): string {
  return requireEnv(["GALA_DINNER"]);
}

function ticketLabel(
  type: TicketType,
  discountKind: "earlyBird" | "permanent30" | null
): string {
  const base = type === "ONE_DAY" ? "1-Day Forum Pass" : "2-Day Forum Pass";
  if (discountKind === "earlyBird") return `${base} — Early Bird`;
  if (discountKind === "permanent30") return `${base} — Permanent 30`;
  return base;
}

export async function createTicketCheckoutSession({
  ticketId,
  email,
  type,
  galaDinner,
  isIbpaMember,
  ticketAmountCents,
  ticketDiscountLabel,
  locale,
}: {
  ticketId: string;
  email: string;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ticketAmountCents: number | null;
  ticketDiscountLabel: "earlyBird" | "permanent30" | null;
  locale: Language;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const hasCustomTicketAmount = ticketAmountCents !== null;

  const forumPassLineItem = hasCustomTicketAmount
    ? {
        price_data: {
          currency: "usd",
          unit_amount: ticketAmountCents,
          product_data: { name: ticketLabel(type, ticketDiscountLabel) },
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
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  return { id: session.id, url: session.url, amountTotalCents: session.amount_total };
}

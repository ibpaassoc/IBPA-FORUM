import "server-only";
import { requireEnv } from "@/lib/env";
import { getAppUrl, getStripe } from "@/features/payments/server/stripe-client";
import type { TicketType } from "@prisma/client";

function getTicketPriceId(type: TicketType, isIbpaMember: boolean): string {
  if (type === "ONE_DAY") {
    return requireEnv([isIbpaMember ? "1_DAY_MEMBER" : "1_DAY_NON_MEMBER"]);
  }
  return requireEnv([isIbpaMember ? "2_DAY_MEMBER" : "2_DAY_NON_MEMBER"]);
}

function getGalaDinnerPriceId(): string {
  return requireEnv(["GALA_DINNER"]);
}

export async function createTicketCheckoutSession({
  ticketId,
  email,
  type,
  galaDinner,
  isIbpaMember,
}: {
  ticketId: string;
  email: string;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();

  const lineItems: { price: string; quantity: number }[] = [
    { price: getTicketPriceId(type, isIbpaMember), quantity: 1 },
  ];

  if (galaDinner) {
    lineItems.push({ price: getGalaDinnerPriceId(), quantity: 1 });
  }

  const metadata = {
    flowType: "ticket",
    ticketId,
    email,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/#pricing`,
    metadata,
    payment_intent_data: { metadata },
    line_items: lineItems,
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  return { id: session.id, url: session.url };
}

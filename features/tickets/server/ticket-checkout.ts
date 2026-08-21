import "server-only";

import type Stripe from "stripe";
import type { TicketType } from "@prisma/client";
import { getAppUrl, getStripe } from "@/features/payments/server/stripe-client";
import {
  SECOND_INSTALLMENT_DELAY_SECONDS,
  splitTicketTotalIntoTwoPayments,
  type TicketPaymentPlan,
} from "@/features/tickets/lib/payment-plan";
import { requireEnv } from "@/lib/env";
import type { Language } from "@/lib/i18n/translations";
import {
  buildSpecialPacketCheckoutMetadata,
  buildSpecialOfferCheckoutMetadata,
  buildTicketCheckoutMetadata,
} from "@/features/tickets/lib/checkout-metadata";
import { getSpecialPacketPriceId } from "@/features/tickets/server/special-packet";

// Stripe Checkout Sessions may live at most 24h. We set this explicitly (rather
// than leaning on the default) so both the initial purchase and an admin-resent
// link have a well-defined, valid expiration and callers never assume a session
// stays payable forever.
const CHECKOUT_SESSION_TTL_SECONDS = 24 * 60 * 60;

export async function createSpecialOfferCheckoutSession({
  ticketId,
  paymentId,
  notificationId,
  email,
  locale,
}: {
  ticketId: string;
  paymentId: string;
  notificationId: string;
  email: string;
  locale: Language;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const metadata = buildSpecialOfferCheckoutMetadata({
    ticketId,
    paymentId,
    notificationId,
    email,
    locale,
  });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/account/applicant/notifications?checkout=success`,
    cancel_url: `${appUrl}/account/applicant/notifications?checkout=canceled`,
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
    metadata,
    payment_intent_data: { metadata },
    line_items: [{ price: requireEnv(["SPECIAL_OFFER_2_DAYS_PRICE"]), quantity: 1 }],
  });

  if (!session.url || session.amount_total === null || !session.currency) {
    throw new Error("Stripe special-offer Checkout is missing required values.");
  }
  return {
    id: session.id,
    url: session.url,
    amountTotalCents: session.amount_total,
    currency: session.currency,
  };
}

function getTicketPriceId(type: TicketType, isIbpaMember: boolean): string {
  if (type === "ONE_DAY") {
    return requireEnv([isIbpaMember ? "ONE_DAY_MEMBER" : "ONE_DAY_NON_MEMBER"]);
  }
  return requireEnv([isIbpaMember ? "TWO_DAYS_MEMBER" : "TWO_DAYS_NON_MEMBER"]);
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

function checkoutChargeAmount(orderAmountCents: number, paymentPlan: TicketPaymentPlan) {
  return paymentPlan === "TWO_INSTALLMENTS"
    ? splitTicketTotalIntoTwoPayments(orderAmountCents).firstAmountCents
    : orderAmountCents;
}

export async function createSpecialPacketCheckoutSession({
  ticketIds,
  paymentId,
  paymentPlan,
  email,
  isIbpaMember,
  locale,
  orderAmountCents,
}: {
  ticketIds: [string, string];
  paymentId: string;
  paymentPlan: TicketPaymentPlan;
  email: string;
  isIbpaMember: boolean;
  locale: Language;
  orderAmountCents: number;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const metadata = buildSpecialPacketCheckoutMetadata({
    ticketIds,
    paymentId,
    paymentPlan,
    email,
    locale,
  });
  const isInstallment = paymentPlan === "TWO_INSTALLMENTS";
  const amountDueNow = checkoutChargeAmount(orderAmountCents, paymentPlan);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = isInstallment
    ? [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountDueNow,
            product_data: { name: "IBPA Special Packet — payment 1 of 2" },
          },
          quantity: 1,
        },
      ]
    : [{ price: getSpecialPacketPriceId(isIbpaMember), quantity: 1 }];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    customer_creation: isInstallment ? "always" : undefined,
    payment_method_types: isInstallment ? ["card"] : undefined,
    success_url: `${appUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/#pricing`,
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
    metadata,
    payment_intent_data: {
      metadata,
      setup_future_usage: isInstallment ? "off_session" : undefined,
    },
    line_items: lineItems,
  });

  if (!session.url || session.amount_total === null) {
    throw new Error("Stripe Special Packet checkout is missing a URL or total.");
  }

  return { id: session.id, url: session.url, amountTotalCents: session.amount_total };
}

export async function createTicketCheckoutSession({
  ticketId,
  paymentId,
  paymentPlan,
  email,
  type,
  galaDinner,
  isIbpaMember,
  orderAmountCents,
  ticketAmountCents,
  ticketDiscountLabel,
  locale,
}: {
  ticketId: string;
  paymentId: string;
  paymentPlan: TicketPaymentPlan;
  email: string;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  orderAmountCents: number;
  ticketAmountCents: number | null;
  ticketDiscountLabel: "earlyBird" | "permanent30" | null;
  locale: Language;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const isInstallment = paymentPlan === "TWO_INSTALLMENTS";
  const hasCustomTicketAmount = ticketAmountCents !== null;

  const forumPassLineItem: Stripe.Checkout.SessionCreateParams.LineItem =
    hasCustomTicketAmount
      ? {
          price_data: {
            currency: "usd",
            unit_amount: ticketAmountCents,
            product_data: { name: ticketLabel(type, ticketDiscountLabel) },
          },
          quantity: 1,
        }
      : { price: getTicketPriceId(type, isIbpaMember), quantity: 1 };

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = isInstallment
    ? [
        {
          price_data: {
            currency: "usd",
            unit_amount: checkoutChargeAmount(orderAmountCents, paymentPlan),
            product_data: { name: "IBPA Forum ticket — payment 1 of 2" },
          },
          quantity: 1,
        },
      ]
    : [forumPassLineItem];

  if (!isInstallment && galaDinner) {
    lineItems.push({ price: getGalaDinnerPriceId(), quantity: 1 });
  }

  const metadata = buildTicketCheckoutMetadata({
    ticketId,
    paymentId,
    paymentPlan,
    email,
    type,
    galaDinner,
    locale,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    customer_creation: isInstallment ? "always" : undefined,
    payment_method_types: isInstallment ? ["card"] : undefined,
    success_url: `${appUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/#pricing`,
    expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
    metadata,
    payment_intent_data: {
      metadata,
      setup_future_usage: isInstallment ? "off_session" : undefined,
    },
    line_items: lineItems,
  });

  if (!session.url || session.amount_total === null) {
    throw new Error("Stripe Checkout session was created without a payment URL or total.");
  }

  return { id: session.id, url: session.url, amountTotalCents: session.amount_total };
}

function stripeId(value: { id: string } | string | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function createSecondInstallmentSchedule({
  session,
  paymentId,
  ticketIds,
  secondAmountCents,
  firstPaidAtUnix,
}: {
  session: Stripe.Checkout.Session;
  paymentId: string;
  ticketIds: string[];
  secondAmountCents: number;
  firstPaidAtUnix: number;
}) {
  const stripe = getStripe();
  const customerId = stripeId(session.customer);
  const paymentIntentId = stripeId(session.payment_intent);
  if (!customerId || !paymentIntentId) {
    throw new Error("Installment Checkout did not create a reusable Stripe customer/payment.");
  }

  const [paymentIntent, lineItems] = await Promise.all([
    stripe.paymentIntents.retrieve(paymentIntentId),
    stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
      expand: ["data.price.product"],
    }),
  ]);
  const paymentMethodId = stripeId(paymentIntent.payment_method);
  const productId = stripeId(lineItems.data[0]?.price?.product ?? null);
  if (!paymentMethodId || !productId) {
    throw new Error("Stripe did not return the saved card or ticket product for payment #2.");
  }

  const metadata = {
    flowType: "ticket_installment",
    paymentId,
    ticketId: ticketIds[0] ?? "",
    ticketIds: ticketIds.join(","),
    installmentNumber: "2",
  };
  const startDate = firstPaidAtUnix + SECOND_INSTALLMENT_DELAY_SECONDS;
  const schedule = await stripe.subscriptionSchedules.create(
    {
      customer: customerId,
      start_date: startDate,
      end_behavior: "cancel",
      metadata,
      default_settings: {
        collection_method: "charge_automatically",
        default_payment_method: paymentMethodId,
      },
      phases: [
        {
          items: [
            {
              price_data: {
                currency: "usd",
                product: productId,
                recurring: { interval: "year", interval_count: 1 },
                unit_amount: secondAmountCents,
              },
              quantity: 1,
            },
          ],
          // One long billing period means the phase can never create a third
          // installment. The paid webhook cancels it immediately; keeping the
          // period open on failure lets Stripe's normal invoice retries run.
          duration: { interval: "year", interval_count: 1 },
          metadata,
        },
      ],
    },
    { idempotencyKey: `ticket-payment-${paymentId}-second-installment` }
  );

  return {
    scheduleId: schedule.id,
    subscriptionId: stripeId(schedule.subscription),
    secondPaymentDueAt: new Date(startDate * 1000),
  };
}

export async function cancelSecondInstallmentSchedule({
  scheduleId,
  paymentId,
}: {
  scheduleId: string;
  paymentId: string;
}) {
  const stripe = getStripe();
  const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
  if (schedule.status !== "not_started" && schedule.status !== "active") return;

  await stripe.subscriptionSchedules.cancel(
    scheduleId,
    { invoice_now: false, prorate: false },
    { idempotencyKey: `ticket-payment-${paymentId}-complete-schedule` }
  );
}

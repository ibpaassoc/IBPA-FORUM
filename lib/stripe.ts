import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return secretKey;
}

export function getAppUrl() {
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL or NEXT_PUBLIC_APP_URL must be configured.");
  }

  return appUrl.replace(/\/+$/, "");
}

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

export async function createJuryCheckoutSession({
  juryApplicationId,
  email,
}: {
  juryApplicationId: string;
  email: string;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();

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
        price_data: {
          currency: "usd",
          unit_amount: 25000,
          product_data: {
            name: "IBPA Jury Registration Fee",
            description: "Official IBPA jury registration fee after admin approval.",
          },
        },
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

export async function createCompetitorCheckoutSession({
  applicationId,
  email,
  categoryId,
  awardId,
}: {
  applicationId: string;
  email: string;
  categoryId: string;
  awardId: string;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();

  const metadata = {
    flowType: "competitor",
    applicationId,
    applicantEmail: email,
    categoryId,
    awardId,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    success_url: `${appUrl}/apply/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/apply/cancel?application_id=${applicationId}`,
    metadata,
    payment_intent_data: {
      metadata,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 5000,
          product_data: {
            name: "IBPA Beauty Championship Application Fee",
            description: "Standard competitor application fee per category.",
          },
        },
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

export function constructStripeEvent(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

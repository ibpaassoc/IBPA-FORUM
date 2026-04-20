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
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
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
  applicationId,
  applicantEmail,
}: {
  applicationId: string;
  applicantEmail: string;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const priceId = process.env.STRIPE_JURY_PRICE;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: applicantEmail,
    success_url: `${appUrl}/jury/register?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/jury`,
    metadata: {
      flowType: "jury",
      applicationId,
      applicantEmail,
    },
    payment_intent_data: {
      metadata: {
        flowType: "jury",
        applicationId,
        applicantEmail,
      },
    },
    line_items: priceId
      ? [
          {
            price: priceId,
            quantity: 1,
          },
        ]
      : [
          {
            price_data: {
              currency: "usd",
              unit_amount: 25000,
              product_data: {
                name: "IBPA Jury Activation Fee",
                description: "Official jury activation fee after admin approval.",
              },
            },
            quantity: 1,
          },
        ],
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session was created without a payment URL.");
  }

  return session;
}

export function constructStripeEvent(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

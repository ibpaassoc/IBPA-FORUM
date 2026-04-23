import { getAppUrl, getStripe } from "@/features/payments/server/stripe-client";

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

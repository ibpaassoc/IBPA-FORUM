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

export function constructStripeEvent(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

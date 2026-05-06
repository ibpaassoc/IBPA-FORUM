import "server-only";
import Stripe from "stripe";
import { isProduction, readEnv, requireEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

function getStripeSecretKey() {
  const secretKey = requireEnv(["STRIPE_SECRET_KEY"]);

  if (isProduction() && secretKey.startsWith("sk_test_")) {
    throw new Error("Production STRIPE_SECRET_KEY must be a live key, not a test key.");
  }

  return secretKey;
}

export function getAppUrl() {
  const appUrl = readEnv(["APP_URL", "FRONTEND_URL", "NEXT_PUBLIC_APP_URL"]);

  if (!appUrl) {
    throw new Error("APP_URL, FRONTEND_URL, or NEXT_PUBLIC_APP_URL must be configured.");
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
  const webhookSecret = requireEnv(["STRIPE_WEBHOOK_SECRET"]);

  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

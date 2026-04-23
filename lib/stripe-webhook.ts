import "server-only";
import type Stripe from "stripe";
import { handleCompetitorStripeEvent } from "@/lib/apply/server";
import { handleJuryStripeEvent } from "@/lib/jury/service";
import { constructStripeEvent } from "@/lib/stripe";

async function dispatchStripeEvent(event: Stripe.Event) {
  if (await handleCompetitorStripeEvent(event)) {
    return;
  }

  await handleJuryStripeEvent(event);
}

export async function processStripeWebhook({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  if (!signature) {
    return {
      status: 400,
      body: {
        message: "Missing Stripe signature.",
      },
    };
  }

  let event: Stripe.Event;

  try {
    event = constructStripeEvent(payload, signature);
  } catch (error) {
    console.error("Failed to verify Stripe webhook signature", error);
    return {
      status: 400,
      body: {
        message: "Invalid Stripe signature.",
      },
    };
  }

  await dispatchStripeEvent(event);

  return {
    status: 200,
    body: {
      received: true,
    },
  };
}

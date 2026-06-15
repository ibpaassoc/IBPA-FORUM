import "server-only";
import type Stripe from "stripe";
import { handleCompetitorStripeEvent } from "@/features/applications/server/webhook.workflow";
import { handleJuryStripeEvent } from "@/features/jury/server/webhook.workflow";
import { handleTicketStripeEvent } from "@/features/tickets/server/ticket-webhook.workflow";
import { constructStripeEvent } from "@/features/payments/server/stripe-client";
import { validateProductionEnv } from "@/lib/env";

async function dispatchStripeEvent(event: Stripe.Event) {
  if (await handleCompetitorStripeEvent(event)) {
    console.info("Stripe webhook handled by competitor workflow", {
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  if (await handleJuryStripeEvent(event)) {
    console.info("Stripe webhook handled by jury workflow", {
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  if (await handleTicketStripeEvent(event)) {
    console.info("Stripe webhook handled by ticket workflow", {
      eventId: event.id,
      eventType: event.type,
    });
    return;
  }

  console.info("Stripe webhook event ignored", {
    eventId: event.id,
    eventType: event.type,
  });
}

export async function processStripeWebhook({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  validateProductionEnv([
    { names: ["STRIPE_SECRET_KEY"], ascii: true },
    { names: ["STRIPE_WEBHOOK_SECRET"], ascii: true },
  ]);

  if (!signature) {
    console.warn("Stripe webhook missing signature");
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
    console.error("Failed to verify Stripe webhook signature", {
      error,
    });
    return {
      status: 400,
      body: {
        message: "Invalid Stripe signature.",
      },
    };
  }

  console.info("Stripe webhook verified", {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
  });

  await dispatchStripeEvent(event);

  return {
    status: 200,
    body: {
      received: true,
    },
  };
}

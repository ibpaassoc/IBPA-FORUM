import "server-only";

import crypto from "node:crypto";
import type Stripe from "stripe";
import { reserveTicketForCheckout } from "@/features/tickets/server/ticket-repository";
import { computeTicketAmountCents } from "@/features/tickets/lib/pricing";
import { calculatePromoDiscount } from "@/features/promos/lib/promo-codes";
import { handleTicketStripeEvent } from "@/features/tickets/server/ticket-webhook.workflow";
import { prisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { deleteTestScenario } from "@/features/test/server/cleanup";

function paidTicketEvent(ticketId: string, sessionId: string, amount: number) {
  const eventId = `evt_test_ticket_${crypto.randomUUID()}`;
  return {
    id: eventId,
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        amount_total: amount,
        currency: "usd",
        payment_intent: `pi_test_ticket_${crypto.randomUUID()}`,
        metadata: { flowType: "ticket", ticketId },
      },
    },
  } as unknown as Stripe.Event;
}

export async function createTestTicketScenario(input: {
  type: "ONE_DAY" | "TWO_DAYS";
  galaDinner: boolean;
  isIbpaMember: boolean;
  discountPercent: 0 | 30 | 40;
  paid: boolean;
}) {
  const scenario = await prisma.testScenario.create({
    data: {
      name: `${input.paid ? "Paid" : "Unpaid"} ${input.type.toLowerCase().replace("_", " ")} ticket`,
      kind: input.paid ? "ticket-paid" : "ticket-unpaid",
      description: "Ticket created through the production reservation and post-payment services.",
      metadata: input,
    },
  });
  try {
    return await runWithDataScope({ dataScope: "TEST", testScenarioId: scenario.id }, async () => {
      const suffix = `${Date.now()}.${crypto.randomBytes(4).toString("hex")}`;
      const email = `test+ticket.${suffix}@example.invalid`;
      const reservation = await reserveTicketForCheckout({
        fullName: `Test Ticket ${suffix.slice(-8)}`,
        email,
        phone: "+1 555 010 4000",
        instagram: "@ibpatest",
        type: input.type,
        galaDinner: input.galaDinner,
        isIbpaMember: input.isIbpaMember,
        ibpaCertNumber: input.isIbpaMember ? "TEST-CERT" : null,
      });
      const base = computeTicketAmountCents({
        type: input.type,
        isIbpaMember: input.isIbpaMember,
        galaDinner: input.galaDinner,
        ticketDiscount: null,
      });
      const promo = calculatePromoDiscount(base.ticketCents, input.discountPercent);
      const amount = promo.finalAmountCents + base.galaCents;
      const sessionId = `cs_test_ticket_${crypto.randomUUID()}`;
      await prisma.ticket.update({
        where: { id: reservation.ticketId },
        data: {
          stripeSessionId: sessionId,
          promoCodeKey: input.discountPercent ? `TICKETS${input.discountPercent}` : null,
          promoCodeKeyword: input.discountPercent ? `TEST${input.discountPercent}` : null,
          promoDiscountPercent: input.discountPercent || null,
          promoDiscountAmount: promo.discountAmountCents || null,
        },
      });
      await prisma.payment.create({
        data: {
          source: "TICKET",
          ticketId: reservation.ticketId,
          stripeSessionId: sessionId,
          provider: "test-stripe-simulator",
          amount,
          currency: "usd",
          promoCodeKey: input.discountPercent ? `TICKETS${input.discountPercent}` : null,
          promoCodeKeyword: input.discountPercent ? `TEST${input.discountPercent}` : null,
          promoDiscountPercent: input.discountPercent || null,
          promoDiscountAmount: promo.discountAmountCents || null,
          status: "PENDING",
        },
      });
      if (input.paid) {
        await handleTicketStripeEvent(paidTicketEvent(reservation.ticketId, sessionId, amount));
      }
      return { scenario, ticketId: reservation.ticketId };
    });
  } catch (error) {
    await deleteTestScenario(scenario.id).catch(() => undefined);
    throw error;
  }
}

export async function completeTestTicketPayment(ticketId: string) {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { payments: { where: { source: "TICKET", status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    const payment = ticket?.payments[0];
    if (!ticket || !payment?.stripeSessionId) throw new Error("A test-scoped pending ticket payment was not found.");
    return handleTicketStripeEvent(paidTicketEvent(ticket.id, payment.stripeSessionId, payment.amount));
  });
}

export function getTestTickets() {
  return runWithDataScope({ dataScope: "TEST" }, () =>
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: { orderBy: { createdAt: "desc" } },
        qrCredentials: { orderBy: { generatedAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
  );
}

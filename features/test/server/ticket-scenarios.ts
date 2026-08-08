import "server-only";

import crypto from "node:crypto";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { reserveTicketForCheckout } from "@/features/tickets/server/ticket-repository";
import { computeTicketAmountCents } from "@/features/tickets/lib/pricing";
import { TEST_TICKET_PRICING } from "@/features/test/fixtures/ticket-pricing";
import { calculatePromoDiscount } from "@/features/promos/lib/promo-codes";
import { handleTicketStripeEvent } from "@/features/tickets/server/ticket-webhook.workflow";
import { parseTicketActivity, parseTicketCredential } from "@/features/database/json-fields";
import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { deleteTestScenario } from "@/features/test/server/cleanup";
import {
  appendTestAudit,
  createTestRun,
  findTestOwningRecord,
  registerTestRecords,
  testJson,
} from "@/features/test/server/test-records";

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
  const test = await createTestRun({
    name: `${input.paid ? "Paid" : "Unpaid"} ${input.type.toLowerCase().replace("_", " ")} ticket`,
    kind: input.paid ? "ticket-paid" : "ticket-unpaid",
    description: "Ticket, payment, credentials and activity stored in the consolidated target models.",
    configuration: input,
  });
  try {
    return await runWithDataScope({ dataScope: "TEST", testId: test.id }, async () => {
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
      // Register the ticket immediately so a later payment or webhook failure
      // cannot leave a test-scoped record outside the cleanup manifest.
      await registerTestRecords(test.id, { tickets: [reservation.ticketId] });
      const base = computeTicketAmountCents({
        type: input.type,
        isIbpaMember: input.isIbpaMember,
        galaDinner: input.galaDinner,
        ticketDiscount: null,
        pricing: TEST_TICKET_PRICING,
      });
      const promo = calculatePromoDiscount(base.ticketCents, input.discountPercent);
      const amount = promo.finalAmountCents + base.galaCents;
      const sessionId = `cs_test_ticket_${crypto.randomUUID()}`;
      const payment = await prisma.payment.create({
        data: {
          customerEmail: email,
          amount,
          currency: "usd",
          status: "PENDING",
          purchaseType: "TICKET",
          provider: "STRIPE",
          stripeCheckoutSessionId: sessionId,
          pricingSnapshot: testJson({ schemaVersion: 1, ...base }),
          promotionSnapshot: input.discountPercent
            ? testJson({ schemaVersion: 1, key: `TICKETS${input.discountPercent}`, keyword: `TEST${input.discountPercent}`, discountPercent: input.discountPercent, discountAmount: promo.discountAmountCents })
            : Prisma.JsonNull,
        },
      });
      await prisma.ticket.update({
        where: { id: reservation.ticketId },
        data: { paymentId: payment.id },
      });
      await registerTestRecords(test.id, { payments: [payment.id] });
      if (input.paid) {
        const event = paidTicketEvent(reservation.ticketId, sessionId, amount);
        await handleTicketStripeEvent(event);
        const webhook = await unscopedPrisma.stripeWebhook.findUnique({ where: { eventId: event.id } });
        if (webhook) await registerTestRecords(test.id, { webhookEvents: [webhook.id] });
      }
      await unscopedPrisma.test.update({ where: { id: test.id }, data: { status: "COMPLETED" } });
      await appendTestAudit(test.id, { action: "CREATE_TICKET_SCENARIO", targetType: "ticket", targetId: reservation.ticketId });
      return { scenario: test, ticketId: reservation.ticketId };
    });
  } catch (error) {
    await unscopedPrisma.test.update({ where: { id: test.id }, data: { status: "FAILED" } }).catch(() => undefined);
    await deleteTestScenario(test.id).catch(() => undefined);
    throw error;
  }
}

export async function completeTestTicketPayment(ticketId: string) {
  const owner = await findTestOwningRecord("tickets", ticketId);
  if (!owner) throw new Error("The ticket is not registered to an active Test run.");
  return runWithDataScope({ dataScope: "TEST", testId: owner.id }, async () => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: { payment: true } });
    if (!ticket?.payment || ticket.payment.status !== "PENDING" || !ticket.payment.stripeCheckoutSessionId) {
      throw new Error("A test-scoped pending ticket payment was not found.");
    }
    const event = paidTicketEvent(ticket.id, ticket.payment.stripeCheckoutSessionId, ticket.payment.amount);
    const result = await handleTicketStripeEvent(event);
    const webhook = await unscopedPrisma.stripeWebhook.findUnique({ where: { eventId: event.id } });
    if (webhook) await registerTestRecords(owner.id, { webhookEvents: [webhook.id] });
    await appendTestAudit(owner.id, { action: "COMPLETE_TICKET_PAYMENT", targetType: "ticket", targetId: ticket.id });
    return result;
  });
}

export function getTestTickets() {
  return runWithDataScope({ dataScope: "TEST" }, async () => {
    const tickets = await prisma.ticket.findMany({
      where: { kind: "FORUM" },
      orderBy: { createdAt: "desc" },
      include: { payment: true },
    });
    return tickets.map((ticket) => {
      const credential = parseTicketCredential(ticket.credential);
      const activity = parseTicketActivity(ticket.activity);
      const promotion = ticket.payment?.promotionSnapshot as { discountPercent?: number } | null;
      return {
        ...ticket,
        type: ticket.type ?? "TWO_DAYS",
        payments: ticket.payment ? [ticket.payment] : [],
        qrCredentials: credential.history.map((item) => ({
          ...item,
          generatedAt: new Date(item.generatedAt),
          replacedAt: item.replacedAt ? new Date(item.replacedAt) : null,
          revokedAt: item.revokedAt ? new Date(item.revokedAt) : null,
        })),
        activities: activity.events.map((event) => ({ ...event, createdAt: new Date(event.createdAt) })),
        promoDiscountPercent: promotion?.discountPercent ?? null,
      };
    });
  });
}

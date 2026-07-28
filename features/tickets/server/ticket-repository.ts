import "server-only";
import crypto from "crypto";
import { prisma } from "@/shared/lib/prisma";
import type { TicketStatus, TicketType } from "@prisma/client";
import { decideTicketReplacement } from "@/features/tickets/lib/replacement";

export type CreateTicketInput = {
  fullName: string;
  email: string;
  phone: string;
  instagram?: string | null;
  type: TicketType;
  galaDinner: boolean;
  isIbpaMember: boolean;
  ibpaCertNumber?: string | null;
};

export async function createTicket(input: CreateTicketInput) {
  const secureToken = crypto.randomBytes(32).toString("hex");

  return prisma.ticket.create({
    data: {
      secureToken,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      instagram: input.instagram ?? null,
      type: input.type,
      galaDinner: input.galaDinner,
      isIbpaMember: input.isIbpaMember,
      ibpaCertNumber: input.ibpaCertNumber ?? null,
      status: "PENDING",
    },
  });
}

export type ReserveTicketResult = { ok: true; ticketId: string };

/**
 * Atomically reserve the single unpaid checkout ticket for a normalized email.
 *
 * Everything runs inside one transaction guarded by a Postgres transaction-level
 * advisory lock keyed on the email, so two near-simultaneous unpaid submissions
 * for the same address are serialized:
 *
 *   • If unpaid ticket(s) exist → the newest is refreshed in place with the new
 *     details (fresh token, Stripe references cleared, old pending payments
 *     removed) and any older unpaid duplicates are deleted. Reusing the row keeps
 *     the Google Sheets sync updating the same line instead of orphaning it.
 *   • Otherwise a brand-new ticket is created. Confirmed tickets for the same
 *     email are left intact and do not block another purchase.
 *
 * Deleting a ticket cascades to its Payment rows (see schema onDelete: Cascade),
 * so no orphaned payment/session references are left behind. Paid tickets are
 * never deleted or modified by this reservation step.
 */
export async function reserveTicketForCheckout(
  input: CreateTicketInput
): Promise<ReserveTicketResult> {
  return prisma.$transaction(async (tx) => {
    // Serialize all reservations for this email (auto-released on commit/rollback).
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.email}))`;

    const existing = await tx.ticket.findMany({
      where: {
        email: { equals: input.email, mode: "insensitive" },
        status: { not: "CANCELED" },
      },
      select: { id: true, status: true },
      orderBy: { createdAt: "desc" },
    });

    const decision = decideTicketReplacement(existing);

    if (decision.deleteIds.length > 0) {
      await tx.ticket.deleteMany({ where: { id: { in: decision.deleteIds } } });
    }

    const secureToken = crypto.randomBytes(32).toString("hex");
    const data = {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      instagram: input.instagram ?? null,
      type: input.type,
      galaDinner: input.galaDinner,
      isIbpaMember: input.isIbpaMember,
      ibpaCertNumber: input.ibpaCertNumber ?? null,
    };

    if (decision.kind === "reuse") {
      // Drop the stale pending payment(s) tied to the old checkout session.
      await tx.payment.deleteMany({ where: { ticketId: decision.reuseId } });
      const ticket = await tx.ticket.update({
        where: { id: decision.reuseId },
        data: {
          ...data,
          secureToken,
          status: "PENDING",
          stripeSessionId: null,
          stripePaymentIntentId: null,
          promoCodeKey: null,
          promoCodeKeyword: null,
          promoDiscountPercent: null,
          promoDiscountAmount: null,
          paidAt: null,
          lastCheckIn: null,
          forumCheckInAt: null,
          galaCheckInAt: null,
        },
      });
      return { ok: true, ticketId: ticket.id };
    }

    const ticket = await tx.ticket.create({
      data: { ...data, secureToken, status: "PENDING" },
    });
    return { ok: true, ticketId: ticket.id };
  });
}

export async function findTicketByStripeSessionId(stripeSessionId: string) {
  return prisma.ticket.findUnique({
    where: { stripeSessionId },
  });
}

export async function findTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
  });
}

export async function findTicketByToken(secureToken: string) {
  return prisma.ticket.findUnique({
    where: { secureToken },
  });
}

export async function findTicketWithPaymentByToken(secureToken: string) {
  return prisma.ticket.findUnique({
    where: { secureToken },
    include: {
      payments: {
        where: { source: "TICKET", status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function findActiveTicketByEmail(email: string) {
  return prisma.ticket.findFirst({
    where: {
      email,
      status: {
        notIn: ["CANCELED"],
      },
    },
    select: { id: true, status: true },
  });
}

export async function checkInTicket(
  ticketId: string,
  status: Extract<TicketStatus, "CHECKED_ONE_DAY" | "CHECKED_TWO_DAY" | "CHECKED_GALA_DINNER">
) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status, lastCheckIn: new Date() },
  });
}

export async function getAllTickets() {
  return prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      instagram: true,
      type: true,
      galaDinner: true,
      isIbpaMember: true,
      status: true,
      paidAt: true,
      lastCheckIn: true,
      forumCheckInAt: true,
      galaCheckInAt: true,
      createdAt: true,
      updatedAt: true,
      payments: {
        where: { source: "TICKET" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { amount: true, currency: true, status: true },
      },
      qrCredentials: {
        orderBy: { generatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          generatedAt: true,
          replacedAt: true,
          revokedAt: true,
          lastSentAt: true,
          lastDeliveryStatus: true,
          lastDeliveryError: true,
        },
      },
    },
  });
}

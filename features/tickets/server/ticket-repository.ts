import "server-only";

import crypto from "crypto";
import type { DataScope, Prisma, TicketStatus, TicketType } from "@prisma/client";
import { decideTicketReplacement } from "@/features/tickets/lib/replacement";
import { isTicketPaymentConfirmed } from "@/features/tickets/lib/ticket-status";
import {
  emptyTicketActivity,
  emptyTicketCredential,
  parseTicketCredential,
  type TicketCredential,
} from "@/features/database/json-fields";
import { prisma } from "@/shared/lib/prisma";

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

export type SpecialPacketAttendeeInput = Omit<CreateTicketInput, "type" | "galaDinner">;

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

function newCredential(token: string, generatedAt = new Date()): TicketCredential {
  const timestamp = generatedAt.toISOString();
  return {
    schemaVersion: 1,
    active: { token, status: "ACTIVE", generatedAt: timestamp, lastSentAt: null },
    history: [
      {
        id: crypto.randomUUID(),
        token,
        status: "ACTIVE",
        generatedAt: timestamp,
        lastSentAt: null,
      },
    ],
  };
}

function ticketData(input: CreateTicketInput, token: string) {
  return {
    kind: "FORUM" as const,
    origin: "STANDARD" as const,
    secureToken: token,
    credential: newCredential(token) as unknown as Prisma.InputJsonValue,
    activity: emptyTicketActivity() as unknown as Prisma.InputJsonValue,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    instagram: input.instagram ?? null,
    type: input.type,
    galaDinner: input.galaDinner,
    isIbpaMember: input.isIbpaMember,
    ibpaCertNumber: input.ibpaCertNumber ?? null,
    status: "PENDING" as const,
  };
}

export async function createTicket(input: CreateTicketInput) {
  const token = newToken();
  return prisma.ticket.create({ data: ticketData(input, token) });
}

export type ReserveTicketResult = { ok: true; ticketId: string };

export async function reserveTicketForCheckout(
  input: CreateTicketInput
): Promise<ReserveTicketResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.email}))`;
    const existing = await tx.ticket.findMany({
      where: {
        kind: "FORUM",
        email: { equals: input.email, mode: "insensitive" },
        specialPacketId: null,
        status: { not: "CANCELED" },
      },
      select: { id: true, status: true, paymentId: true },
      orderBy: { createdAt: "desc" },
    });
    const decision = decideTicketReplacement(existing);

    if (decision.deleteIds.length > 0) {
      const obsolete = existing.filter((item) => decision.deleteIds.includes(item.id));
      const paymentIds = obsolete.flatMap((item) => (item.paymentId ? [item.paymentId] : []));
      await tx.ticket.deleteMany({ where: { id: { in: decision.deleteIds } } });
      if (paymentIds.length > 0) {
        await tx.payment.deleteMany({ where: { id: { in: paymentIds }, status: { not: "PAID" } } });
      }
    }

    const token = newToken();
    if (decision.kind === "reuse") {
      const current = existing.find((item) => item.id === decision.reuseId);
      const ticket = await tx.ticket.update({
        where: { id: decision.reuseId },
        data: {
          ...ticketData(input, token),
          paymentId: null,
          paidAt: null,
          lastCheckIn: null,
          forumCheckInAt: null,
          dayOneCheckInAt: null,
          dayTwoCheckInAt: null,
          galaCheckInAt: null,
          revision: { increment: 1 },
        },
      });
      if (current?.paymentId) {
        await tx.payment.deleteMany({ where: { id: current.paymentId, status: { not: "PAID" } } });
      }
      return { ok: true, ticketId: ticket.id };
    }

    const ticket = await tx.ticket.create({ data: ticketData(input, token) });
    return { ok: true, ticketId: ticket.id };
  });
}

export async function reserveSpecialPacketForCheckout({
  attendees,
}: {
  attendees: [SpecialPacketAttendeeInput, SpecialPacketAttendeeInput];
}) {
  return prisma.$transaction(async (tx) => {
    const normalizedEmails = [...new Set(attendees.map((attendee) => attendee.email))].sort();
    for (const email of normalizedEmails) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${email}))`;
    }
    const previous = await tx.ticket.findMany({
      where: {
        kind: "FORUM",
        email: { in: normalizedEmails, mode: "insensitive" },
        status: "PENDING",
        specialPacketId: { not: null },
      },
      select: { id: true, specialPacketId: true, paymentId: true },
    });
    if (previous.length > 0) {
      const previousIds = previous.map((item) => item.id);
      const paymentIds = previous.flatMap((item) => (item.paymentId ? [item.paymentId] : []));
      await tx.ticket.deleteMany({ where: { id: { in: previousIds } } });
      if (paymentIds.length > 0) {
        await tx.payment.deleteMany({ where: { id: { in: paymentIds }, status: { not: "PAID" } } });
      }
    }

    const specialPacketId = crypto.randomUUID();
    const tickets = [];
    for (const [index, attendee] of attendees.entries()) {
      const token = newToken();
      tickets.push(
        await tx.ticket.create({
          data: {
            ...ticketData({ ...attendee, type: "TWO_DAYS", galaDinner: true }, token),
            origin: "SPECIAL_PACKET",
            specialPacketId,
            specialPacketPosition: index + 1,
          },
        })
      );
    }
    return { specialPacketId, tickets };
  });
}

export async function createComplimentaryGalaTicket(
  tx: Prisma.TransactionClient,
  input: {
    accountId: string;
    fullName: string;
    email: string;
    phone: string;
    dataScope: DataScope;
  },
) {
  const token = newToken();
  const now = new Date();
  return tx.ticket.create({
    data: {
      accountId: input.accountId,
      kind: "FORUM",
      origin: "JURY_GALA",
      secureToken: token,
      credential: newCredential(token, now) as unknown as Prisma.InputJsonValue,
      activity: emptyTicketActivity() as unknown as Prisma.InputJsonValue,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      // The legacy database constraint requires every FORUM record to carry a
      // type. Access is still gala-only because JURY_GALA is authoritative in
      // scanner scope validation and admin presentation.
      type: "TWO_DAYS",
      galaDinner: true,
      status: "PAID",
      paidAt: now,
      dataScope: input.dataScope,
    },
  });
}

export async function createSpecialOfferTicket(
  tx: Prisma.TransactionClient,
  input: {
    accountId: string;
    fullName: string;
    email: string;
    phone: string;
    dataScope: DataScope;
  },
) {
  const token = newToken();
  return tx.ticket.create({
    data: {
      ...ticketData(
        {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          type: "TWO_DAYS",
          galaDinner: false,
          isIbpaMember: false,
        },
        token,
      ),
      accountId: input.accountId,
      origin: "SPECIAL_OFFER",
      credential: emptyTicketCredential() as unknown as Prisma.InputJsonValue,
      dataScope: input.dataScope,
    },
  });
}

export async function findTicketByStripeSessionId(stripeSessionId: string) {
  return prisma.ticket.findFirst({
    where: { payment: { stripeCheckoutSessionId: stripeSessionId } },
  });
}

export async function findTicketById(id: string) {
  return prisma.ticket.findUnique({ where: { id }, include: { payment: true } });
}

export async function findSpecialPacketTickets(specialPacketId: string) {
  return prisma.ticket.findMany({
    where: { specialPacketId },
    include: { payment: true },
    orderBy: { specialPacketPosition: "asc" },
  });
}

export async function findTicketsByIds(ids: string[]) {
  return prisma.ticket.findMany({ where: { id: { in: ids } }, orderBy: { specialPacketPosition: "asc" } });
}

export async function findTicketByToken(secureToken: string) {
  return prisma.ticket.findUnique({ where: { secureToken } });
}

export async function findTicketWithPaymentByToken(secureToken: string) {
  const ticket = await prisma.ticket.findUnique({ where: { secureToken }, include: { payment: true } });
  if (!ticket) return null;
  let payment = isTicketPaymentConfirmed(ticket.status) ? ticket.payment : null;
  if (!payment && ticket.specialPacketId) {
    payment = await prisma.payment.findFirst({
      where: {
        purchaseType: "TICKET",
        status: { in: ["PARTIALLY_PAID", "PAST_DUE", "PAID"] },
        tickets: { some: { specialPacketId: ticket.specialPacketId } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  return { ...ticket, payments: payment ? [payment] : [] };
}

export async function findActiveTicketByEmail(email: string) {
  return prisma.ticket.findFirst({
    where: { email, status: { notIn: ["CANCELED"] } },
    select: { id: true, status: true },
  });
}

export async function checkInTicket(
  ticketId: string,
  status: Extract<TicketStatus, "CHECKED_ONE_DAY" | "CHECKED_TWO_DAY" | "CHECKED_GALA_DINNER">
) {
  const checkedInAt = new Date();
  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status,
      lastCheckIn: checkedInAt,
      revision: { increment: 1 },
      ...(status === "CHECKED_GALA_DINNER"
        ? { galaCheckInAt: checkedInAt }
        : status === "CHECKED_TWO_DAY"
          ? { dayTwoCheckInAt: checkedInAt }
          : { dayOneCheckInAt: checkedInAt, forumCheckInAt: checkedInAt }),
    },
  });
}

function credentialRows(value: Prisma.JsonValue) {
  const credential = parseTicketCredential(value);
  return credential.history
    .slice()
    .reverse()
    .map((item) => ({
      id: item.id,
      status: item.status,
      generatedAt: new Date(item.generatedAt),
      replacedAt: item.replacedAt ? new Date(item.replacedAt) : null,
      revokedAt: item.revokedAt ? new Date(item.revokedAt) : null,
      lastSentAt: item.lastSentAt ? new Date(item.lastSentAt) : null,
      lastDeliveryStatus: item.lastDeliveryStatus ?? null,
      lastDeliveryError: item.lastDeliveryError ?? null,
    }));
}

export async function getAllTickets() {
  const tickets = await prisma.ticket.findMany({
    where: { kind: "FORUM" },
    orderBy: { createdAt: "desc" },
    include: {
      payment: {
        select: {
          amount: true,
          currency: true,
          status: true,
          paymentPlan: true,
          nextPaymentAt: true,
          lastPaymentError: true,
          lastPaymentFailedAt: true,
        },
      },
    },
  });
  return tickets.map((ticket) => ({
    ...ticket,
    type: ticket.origin === "JURY_GALA" ? "GALA_ONLY" : (ticket.type ?? "TWO_DAYS"),
    payments: ticket.payment ? [ticket.payment] : [],
    qrCredentials: credentialRows(ticket.credential).slice(0, 5),
  }));
}

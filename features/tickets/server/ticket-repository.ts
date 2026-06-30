import "server-only";
import crypto from "crypto";
import { prisma } from "@/shared/lib/prisma";
import type { TicketStatus, TicketType } from "@prisma/client";

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

export async function findTicketByStripeSessionId(stripeSessionId: string) {
  return prisma.ticket.findUnique({
    where: { stripeSessionId },
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
      lastCheckIn: true,
      forumCheckInAt: true,
      galaCheckInAt: true,
      createdAt: true,
      payments: {
        where: { source: "TICKET" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { amount: true, currency: true, status: true },
      },
    },
  });
}

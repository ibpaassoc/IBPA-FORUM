import "server-only";

import { adminT } from "@/lib/i18n/admin";
import crypto from "crypto";
import type { Prisma, Ticket, TicketQrCredential } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { syncTicketOnChange } from "@/features/google-sheets";
import {
  adminTicketUpdateSchema,
  compareEditableTicketChanges,
  getEditableTicketSnapshot,
  hasQrRelevantChanges,
  ticketCanReceiveQr,
  type AdminTicketUpdateInput,
} from "@/features/tickets/lib/admin-ticket-rules";
import { sendTicketQrEmail } from "./ticket-email.workflow";
import { generateTicketQRDataUrl } from "./ticket-qr";

type Tx = Prisma.TransactionClient;

function newQrToken() {
  return crypto.randomBytes(32).toString("hex");
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export type AdminTicketMutationResult =
  | {
      ok: true;
      ticket: Awaited<ReturnType<typeof getAdminTicketById>>;
      qrRegenerated: boolean;
      email?: { delivered: boolean; reason?: string; error?: string };
    }
  | {
      ok: false;
      reason: "invalid" | "not_found" | "stale" | "not_eligible" | "email_failed";
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      ticket?: Awaited<ReturnType<typeof getAdminTicketById>>;
    };

export async function getAdminTicketById(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      secureToken: true,
      fullName: true,
      email: true,
      phone: true,
      instagram: true,
      type: true,
      galaDinner: true,
      isIbpaMember: true,
      specialPacketId: true,
      specialPacketPosition: true,
      status: true,
      paidAt: true,
      lastCheckIn: true,
      forumCheckInAt: true,
      dayOneCheckInAt: true,
      dayTwoCheckInAt: true,
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

export async function ensureActiveTicketQr(
  ticketId: string,
  tx: Tx = prisma
): Promise<TicketQrCredential | null> {
  const ticket = await tx.ticket.findUnique({
    where: { id: ticketId },
    include: {
      qrCredentials: {
        where: { status: "ACTIVE" },
        orderBy: { generatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!ticket || !ticketCanReceiveQr(ticket.status)) return null;

  const active = ticket.qrCredentials[0];
  if (active) return active;

  return tx.ticketQrCredential.create({
    data: {
      ticketId: ticket.id,
      token: ticket.secureToken,
      status: "ACTIVE",
      generatedAt: ticket.paidAt ?? ticket.createdAt,
    },
  });
}

async function replaceActiveQrCredential(
  tx: Tx,
  ticket: Pick<Ticket, "id">,
  activityType: "QR_GENERATED" | "QR_REGENERATED",
  adminId?: string | null
) {
  const now = new Date();
  const token = newQrToken();

  const previous = await tx.ticketQrCredential.findMany({
    where: { ticketId: ticket.id, status: "ACTIVE" },
    select: { id: true, token: true },
  });

  if (previous.length > 0) {
    await tx.ticketQrCredential.updateMany({
      where: { ticketId: ticket.id, status: "ACTIVE" },
      data: { status: "REPLACED", replacedAt: now },
    });
  }

  await tx.ticket.update({
    where: { id: ticket.id },
    data: { secureToken: token },
  });

  const credential = await tx.ticketQrCredential.create({
    data: {
      ticketId: ticket.id,
      token,
      status: "ACTIVE",
      generatedAt: now,
    },
  });

  await tx.ticketActivity.create({
    data: {
      ticketId: ticket.id,
      adminId: adminId ?? null,
      type: activityType,
      previousValues: toJson({ tokens: previous.map((item) => item.token) }),
      newValues: toJson({ token }),
    },
  });

  return credential;
}

export async function regenerateTicketQr(ticketId: string, adminId?: string | null) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ticketId}))`;
    const ticket = await tx.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { ok: false as const, reason: "not_found" as const };
    if (!ticketCanReceiveQr(ticket.status)) return { ok: false as const, reason: "not_eligible" as const };
    const credential = await replaceActiveQrCredential(tx, ticket, "QR_REGENERATED", adminId);
    return { ok: true as const, credential };
  });
}

export async function updateAdminTicket(
  rawInput: unknown,
  options: { sendUpdatedQr?: boolean; adminId?: string | null } = {}
): Promise<AdminTicketMutationResult> {
  const parsed = adminTicketUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      message: adminT.tickets.admin.invalidFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input: AdminTicketUpdateInput = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.ticketId}))`;

    const current = await tx.ticket.findUnique({ where: { id: input.ticketId } });
    if (!current) {
      return { ok: false as const, reason: "not_found" as const, message: adminT.api.ticketNotFound };
    }

    if (current.updatedAt.toISOString() !== input.updatedAt) {
      return {
        ok: false as const,
        reason: "stale" as const,
        message: adminT.tickets.admin.staleTicket,
      };
    }

    const previous = getEditableTicketSnapshot(current);
    const next = getEditableTicketSnapshot({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      instagram: input.instagram,
      type: input.type,
      galaDinner: input.galaDinner,
    });
    const changes = compareEditableTicketChanges(previous, next);
    const qrRelevant = hasQrRelevantChanges(changes);

    const updated = await tx.ticket.update({
      where: { id: current.id },
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        instagram: input.instagram,
        type: input.type,
        galaDinner: input.galaDinner,
      },
    });

    if (changes.length > 0) {
      await tx.ticketActivity.create({
        data: {
          ticketId: current.id,
          adminId: options.adminId ?? null,
          type: "UPDATED",
          changedFields: toJson(changes.map((change) => change.field)),
          previousValues: toJson(previous),
          newValues: toJson(next),
        },
      });
    }

    let qrCredential: TicketQrCredential | null = null;
    if (qrRelevant && ticketCanReceiveQr(updated.status)) {
      qrCredential = await replaceActiveQrCredential(
        tx,
        updated,
        "QR_REGENERATED",
        options.adminId
      );
    }

    return {
      ok: true as const,
      qrRelevant,
      updated,
      qrCredential,
    };
  });

  if (!result.ok) return result;

  syncTicketOnChange(input.ticketId);

  let emailResult: { delivered: boolean; reason?: string; error?: string } | undefined;
  if (result.qrCredential && options.sendUpdatedQr) {
    const delivery = await sendCurrentTicketQr(input.ticketId, {
      adminId: options.adminId,
      accessUpdated: true,
    });
    if (!delivery.ok && delivery.reason === "email_failed") {
      emailResult = {
        delivered: false,
        reason: delivery.delivery.reason,
        error: delivery.delivery.error,
      };
    } else if (delivery.ok) {
      emailResult = { delivered: true };
    }
  }

  return {
    ok: true,
    ticket: await getAdminTicketById(input.ticketId),
    qrRegenerated: Boolean(result.qrCredential),
    email: emailResult,
  };
}

export async function getTicketQrPreview(ticketId: string) {
  const ticket = await getAdminTicketById(ticketId);
  if (!ticket) return { ok: false as const, reason: "not_found" as const };

  const active = ticket.qrCredentials.find((credential) => credential.status === "ACTIVE") ?? null;
  if (!active) {
    return { ok: true as const, ticket, credential: null, qrDataUrl: null };
  }

  const qrDataUrl = await generateTicketQRDataUrl(ticket.secureToken);
  return { ok: true as const, ticket, credential: active, qrDataUrl };
}

export async function sendCurrentTicketQr(
  ticketId: string,
  options: { adminId?: string | null; accessUpdated?: boolean } = {}
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      qrCredentials: {
        where: { status: "ACTIVE" },
        orderBy: { generatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!ticket) return { ok: false as const, reason: "not_found" as const };
  if (!ticketCanReceiveQr(ticket.status)) return { ok: false as const, reason: "not_eligible" as const };

  let credential = ticket.qrCredentials[0];
  if (!credential) {
    const generated = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ticket.id}))`;
      return ensureActiveTicketQr(ticket.id, tx);
    });
    if (!generated) return { ok: false as const, reason: "not_eligible" as const };
    credential = generated;
  }

  const delivery = await sendTicketQrEmail({
    to: ticket.email,
    fullName: ticket.fullName,
    type: ticket.type,
    galaDinner: ticket.galaDinner,
    secureToken: credential.token,
    instagram: ticket.instagram,
    accessUpdated: options.accessUpdated ?? false,
    specialPacket: Boolean(ticket.specialPacketId),
  });

  await prisma.$transaction(async (tx) => {
    await tx.ticketQrCredential.update({
      where: { id: credential.id },
      data: {
        lastSentAt: new Date(),
        lastDeliveryStatus: delivery.delivered ? "delivered" : "failed",
        lastDeliveryProviderId: delivery.providerId ?? null,
        lastDeliveryError: delivery.error ?? delivery.reason ?? null,
      },
    });
    await tx.ticketActivity.create({
      data: {
        ticketId: ticket.id,
        adminId: options.adminId ?? null,
        type: delivery.delivered ? "QR_RESENT" : "QR_EMAIL_FAILED",
        emailDelivery: toJson(delivery),
      },
    });
  });

  if (!delivery.delivered) {
    return { ok: false as const, reason: "email_failed" as const, delivery };
  }

  return { ok: true as const, delivery };
}

export async function regenerateAndSendTicketQr(ticketId: string, adminId?: string | null) {
  const regenerated = await regenerateTicketQr(ticketId, adminId);
  if (!regenerated.ok) return regenerated;

  const sent = await sendCurrentTicketQr(ticketId, { adminId, accessUpdated: true });
  if (!sent.ok && sent.reason === "email_failed") {
    return {
      ok: false as const,
      reason: "email_failed" as const,
      message:
        adminT.tickets.admin.regeneratedQrDeliveryFailed,
      delivery: sent.delivery,
    };
  }

  syncTicketOnChange(ticketId);
  return { ok: true as const, delivery: sent.ok ? sent.delivery : undefined };
}

import "server-only";

import crypto from "crypto";
import type { Prisma, Ticket } from "@prisma/client";
import { adminT } from "@/lib/i18n/admin";
import {
  parseTicketActivity,
  parseTicketCredential,
  type TicketActivity,
  type TicketCredential,
} from "@/features/database/json-fields";
import { syncTicketOnChange } from "@/features/google-sheets";
import {
  ADMIN_GENERATED_VALUE,
  adminManualTicketSchema,
  adminTicketUpdateSchema,
  compareEditableTicketChanges,
  getEditableTicketSnapshot,
  hasQrRelevantChanges,
  ticketCanBeDeleted,
  ticketCanReceiveQr,
  type AdminTicketUpdateInput,
} from "@/features/tickets/lib/admin-ticket-rules";
import { prisma } from "@/shared/lib/prisma";
import { sendTicketQrEmail } from "./ticket-email.workflow";
import { generateTicketQRDataUrl } from "./ticket-qr";
import {
  createAdminManualTicket,
  findAdminManualTicketRecipient,
} from "./ticket-repository";

type Tx = Prisma.TransactionClient;
type CredentialHistoryItem = TicketCredential["history"][number];

function newQrToken() {
  return crypto.randomBytes(32).toString("hex");
}

function credentialView(item: CredentialHistoryItem) {
  return {
    id: item.id,
    token: item.token,
    status: item.status,
    generatedAt: new Date(item.generatedAt),
    replacedAt: item.replacedAt ? new Date(item.replacedAt) : null,
    revokedAt: item.revokedAt ? new Date(item.revokedAt) : null,
    lastSentAt: item.lastSentAt ? new Date(item.lastSentAt) : null,
    lastDeliveryStatus: item.lastDeliveryStatus ?? null,
    lastDeliveryProviderId: item.lastDeliveryProviderId ?? null,
    lastDeliveryError: item.lastDeliveryError ?? null,
  };
}

function getActiveCredential(value: unknown) {
  const credential = parseTicketCredential(value);
  if (!credential.active) return null;
  const historyItem = credential.history.find(
    (item) => item.status === "ACTIVE" && item.token === credential.active?.token
  );
  return historyItem
    ? credentialView(historyItem)
    : credentialView({
        id: crypto.randomUUID(),
        token: credential.active.token,
        status: "ACTIVE",
        generatedAt: credential.active.generatedAt ?? new Date().toISOString(),
        lastSentAt: credential.active.lastSentAt ?? null,
        lastDeliveryStatus: credential.active.lastDeliveryStatus ?? null,
        lastDeliveryProviderId: credential.active.lastDeliveryProviderId ?? null,
        lastDeliveryError: credential.active.lastDeliveryError ?? null,
      });
}

function appendActivity(
  activity: TicketActivity,
  type: string,
  details: Record<string, unknown> = {}
): TicketActivity {
  return {
    ...activity,
    events: [
      ...activity.events,
      { id: crypto.randomUUID(), type, createdAt: new Date().toISOString(), ...details },
    ],
  };
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
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { payment: { select: { amount: true, currency: true, status: true } } },
  });
  if (!ticket) return null;
  const credential = parseTicketCredential(ticket.credential);
  return {
    ...ticket,
    manualIssue: parseTicketActivity(ticket.activity).events.some(
      (event) => event.type === "CREATED_MANUALLY"
    ),
    payments: ticket.payment ? [ticket.payment] : [],
    qrCredentials: credential.history.slice().reverse().map(credentialView).slice(0, 5),
  };
}

export async function createAndSendAdminManualTicket(rawInput: unknown) {
  const parsed = adminManualTicketSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      reason: "invalid" as const,
      message: adminT.tickets.manual.invalidFields,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const recipient = parsed.data.recipientSource === "EXISTING"
    ? await findAdminManualTicketRecipient(parsed.data.accountId, parsed.data.recipientType)
    : {
        id: null,
        applicantProfileId: null,
        role: "MANUAL" as const,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
      };
  if (!recipient) {
    return {
      ok: false as const,
      reason: "invalid" as const,
      message: adminT.tickets.manual.recipientUnavailable,
    };
  }

  const ticket = await createAdminManualTicket({
    accountId: recipient.id,
    applicantProfileId: recipient.applicantProfileId,
    recipientRole: recipient.role,
    fullName: recipient.fullName,
    email: recipient.email.trim().toLowerCase(),
    phone: ADMIN_GENERATED_VALUE,
    instagram: null,
    type: parsed.data.type,
    galaDinner: parsed.data.galaDinner,
    isIbpaMember: false,
  });
  let delivery;
  try {
    delivery = await sendCurrentTicketQr(ticket.id);
  } catch (error) {
    console.error("Failed to send a manually issued ticket", { ticketId: ticket.id, error });
    syncTicketOnChange(ticket.id);
    return {
      ok: false as const,
      reason: "email_failed" as const,
      created: true as const,
      ticketId: ticket.id,
      message: adminT.tickets.manual.emailFailed,
    };
  }

  syncTicketOnChange(ticket.id);
  if (!delivery.ok) {
    return {
      ok: false as const,
      reason: "email_failed" as const,
      created: true as const,
      ticketId: ticket.id,
      message: adminT.tickets.manual.emailFailed,
    };
  }

  return {
    ok: true as const,
    ticket: await getAdminTicketById(ticket.id),
    message: adminT.tickets.manual.created,
  };
}

export async function deleteUnpaidAdminTicket(ticketId: string) {
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ticketId}))`;
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      include: { payment: { select: { id: true, status: true } } },
    });
    if (!ticket) return { ok: false as const, reason: "not_found" as const };
    if (!ticketCanBeDeleted(ticket.status, ticket.payment?.status)) {
      return { ok: false as const, reason: "paid" as const };
    }

    const ticketsToDelete = ticket.specialPacketId
      ? await tx.ticket.findMany({
          where: { specialPacketId: ticket.specialPacketId },
          select: { id: true, status: true, payment: { select: { status: true } } },
        })
      : [ticket];
    if (
      ticketsToDelete.some((item) => !ticketCanBeDeleted(item.status, item.payment?.status))
    ) {
      return { ok: false as const, reason: "paid" as const };
    }

    const deletedIds = ticketsToDelete.map((item) => item.id);
    const paymentId = ticket.payment?.id ?? null;
    await tx.ticket.deleteMany({ where: { id: { in: deletedIds } } });
    if (paymentId) {
      await tx.payment.deleteMany({
        where: {
          id: paymentId,
          status: { notIn: ["PAID", "PARTIALLY_PAID", "PAST_DUE"] },
          tickets: { none: {} },
        },
      });
    }
    return { ok: true as const, deletedIds };
  });

  if (result.ok) result.deletedIds.forEach((id) => syncTicketOnChange(id));
  return result;
}

export async function ensureActiveTicketQr(ticketId: string, tx: Tx = prisma) {
  const ticket = await tx.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || !ticketCanReceiveQr(ticket.status)) return null;
  const credential = parseTicketCredential(ticket.credential);
  const existing = getActiveCredential(credential);
  if (existing) return existing;

  const now = ticket.paidAt ?? ticket.createdAt;
  const token = ticket.secureToken || newQrToken();
  const item: CredentialHistoryItem = {
    id: crypto.randomUUID(),
    token,
    status: "ACTIVE",
    generatedAt: now.toISOString(),
    lastSentAt: null,
  };
  const next: TicketCredential = {
    ...credential,
    active: { token, status: "ACTIVE", generatedAt: item.generatedAt, lastSentAt: null },
    history: [...credential.history, item],
  };
  await tx.ticket.update({
    where: { id: ticket.id },
    data: { secureToken: token, credential: next, revision: { increment: 1 } },
  });
  return credentialView(item);
}

async function replaceActiveQrCredential(
  tx: Tx,
  ticket: Pick<Ticket, "id" | "credential" | "activity">,
  activityType: "QR_GENERATED" | "QR_REGENERATED",
  adminId?: string | null
) {
  const now = new Date().toISOString();
  const token = newQrToken();
  const credential = parseTicketCredential(ticket.credential);
  const history = credential.history.map((item) =>
    item.status === "ACTIVE"
      ? { ...item, status: "REPLACED" as const, replacedAt: now }
      : item
  );
  const item: CredentialHistoryItem = {
    id: crypto.randomUUID(),
    token,
    status: "ACTIVE",
    generatedAt: now,
    lastSentAt: null,
  };
  const nextCredential: TicketCredential = {
    schemaVersion: 1,
    active: { token, status: "ACTIVE", generatedAt: now, lastSentAt: null },
    history: [...history, item],
  };
  const nextActivity = appendActivity(parseTicketActivity(ticket.activity), activityType, {
    adminId: adminId ?? null,
    replacedCredentialIds: history
      .filter((entry) => entry.status === "REPLACED" && entry.replacedAt === now)
      .map((entry) => entry.id),
    credentialId: item.id,
  });
  await tx.ticket.update({
    where: { id: ticket.id },
    data: {
      secureToken: token,
      credential: nextCredential,
      activity: nextActivity as unknown as Prisma.InputJsonValue,
      revision: { increment: 1 },
    },
  });
  return credentialView(item);
}

export async function regenerateTicketQr(ticketId: string, adminId?: string | null) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ticketId}))`;
    const ticket = await tx.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return { ok: false as const, reason: "not_found" as const };
    if (!ticketCanReceiveQr(ticket.status)) {
      return { ok: false as const, reason: "not_eligible" as const };
    }
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
      return { ok: false as const, reason: "stale" as const, message: adminT.tickets.admin.staleTicket };
    }
    if (!current.type) {
      return { ok: false as const, reason: "not_eligible" as const, message: adminT.api.ticketNotFound };
    }
    const previous = getEditableTicketSnapshot({ ...current, type: current.type });
    const next = getEditableTicketSnapshot(input);
    const changes = compareEditableTicketChanges(previous, next);
    const qrRelevant = hasQrRelevantChanges(changes);
    let activity = parseTicketActivity(current.activity);
    if (changes.length > 0) {
      activity = appendActivity(activity, "UPDATED", {
        adminId: options.adminId ?? null,
        changedFields: changes.map((change) => change.field),
        previousValues: previous,
        newValues: next,
      });
    }
    const updated = await tx.ticket.update({
      where: { id: current.id },
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        instagram: input.instagram,
        type: input.type,
        galaDinner: input.galaDinner,
        activity: activity as unknown as Prisma.InputJsonValue,
        revision: { increment: 1 },
      },
    });
    const qrCredential =
      qrRelevant && ticketCanReceiveQr(updated.status)
        ? await replaceActiveQrCredential(tx, updated, "QR_REGENERATED", options.adminId)
        : null;
    return { ok: true as const, qrRelevant, qrCredential };
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
  if (!active) return { ok: true as const, ticket, credential: null, qrDataUrl: null };
  return {
    ok: true as const,
    ticket,
    credential: active,
    qrDataUrl: await generateTicketQRDataUrl(ticket.secureToken),
  };
}

export async function sendCurrentTicketQr(
  ticketId: string,
  options: { adminId?: string | null; accessUpdated?: boolean } = {}
) {
  let ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false as const, reason: "not_found" as const };
  if (!ticketCanReceiveQr(ticket.status) || !ticket.type) {
    return { ok: false as const, reason: "not_eligible" as const };
  }
  const ticketType = ticket.type;
  let credential = getActiveCredential(ticket.credential);
  if (!credential) {
    credential = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ticketId}))`;
      return ensureActiveTicketQr(ticketId, tx);
    });
    ticket = (await prisma.ticket.findUnique({ where: { id: ticketId } })) ?? ticket;
  }
  if (!credential) return { ok: false as const, reason: "not_eligible" as const };

  const delivery = await sendTicketQrEmail({
    to: ticket.email,
    fullName: ticket.fullName,
    type: ticketType,
    galaDinner: ticket.galaDinner,
    secureToken: credential.token,
    instagram: ticket.instagram,
    accessUpdated: options.accessUpdated ?? false,
    specialPacket: Boolean(ticket.specialPacketId),
    manualIssue: parseTicketActivity(ticket.activity).events.some(
      (event) => event.type === "CREATED_MANUALLY"
    ),
  });

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ticketId}))`;
    const current = await tx.ticket.findUniqueOrThrow({ where: { id: ticketId } });
    const now = new Date().toISOString();
    const parsedCredential = parseTicketCredential(current.credential);
    const patchDelivery = (item: CredentialHistoryItem): CredentialHistoryItem =>
      item.id === credential.id
        ? {
            ...item,
            lastSentAt: now,
            lastDeliveryStatus: delivery.delivered ? "delivered" : "failed",
            lastDeliveryProviderId: delivery.providerId ?? null,
            lastDeliveryError: delivery.error ?? delivery.reason ?? null,
          }
        : item;
    const history = parsedCredential.history.map(patchDelivery);
    const activeItem = history.find((item) => item.id === credential.id) ?? null;
    const nextCredential: TicketCredential = {
      ...parsedCredential,
      active: activeItem
        ? {
            token: activeItem.token,
            status: "ACTIVE",
            generatedAt: activeItem.generatedAt,
            lastSentAt: activeItem.lastSentAt,
            lastDeliveryStatus: activeItem.lastDeliveryStatus,
            lastDeliveryProviderId: activeItem.lastDeliveryProviderId,
            lastDeliveryError: activeItem.lastDeliveryError,
          }
        : parsedCredential.active,
      history,
    };
    const activity = appendActivity(
      parseTicketActivity(current.activity),
      delivery.delivered ? "QR_RESENT" : "QR_EMAIL_FAILED",
      { adminId: options.adminId ?? null, credentialId: credential.id, delivery }
    );
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        credential: nextCredential as unknown as Prisma.InputJsonValue,
        activity: activity as unknown as Prisma.InputJsonValue,
        revision: { increment: 1 },
      },
    });
  });

  return delivery.delivered
    ? { ok: true as const, delivery }
    : { ok: false as const, reason: "email_failed" as const, delivery };
}

export async function regenerateAndSendTicketQr(ticketId: string, adminId?: string | null) {
  const regenerated = await regenerateTicketQr(ticketId, adminId);
  if (!regenerated.ok) return regenerated;
  const sent = await sendCurrentTicketQr(ticketId, { adminId, accessUpdated: true });
  if (!sent.ok && sent.reason === "email_failed") {
    return {
      ok: false as const,
      reason: "email_failed" as const,
      message: adminT.tickets.admin.regeneratedQrDeliveryFailed,
      delivery: sent.delivery,
    };
  }
  syncTicketOnChange(ticketId);
  return { ok: true as const, delivery: sent.ok ? sent.delivery : undefined };
}

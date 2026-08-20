import "server-only";

import type { Prisma } from "@prisma/client";
import { getSpecialOffer2DaysAmountFromStripe } from "@/features/pricing/server/stripe-pricing";
import { createSpecialOfferCheckoutSession } from "@/features/tickets/server/ticket-checkout";
import {
  createComplimentaryGalaTicket,
  createSpecialOfferTicket,
} from "@/features/tickets/server/ticket-repository";
import { parseNotificationContent } from "@/features/notifications/lib/content";
import { sendJuryGalaQrEmail } from "@/features/notifications/server/email";
import { prisma } from "@/shared/lib/prisma";
import type { Language } from "@/lib/i18n/translations";

export async function getNotificationsForAccount(accountId: string, take?: number) {
  const rows = await prisma.notification.findMany({
    where: { accountId },
    orderBy: { dateCreated: "desc" },
    ...(take ? { take } : {}),
  });
  return rows.map((row) => ({ ...row, content: parseNotificationContent(row.content) }));
}

export async function getNextUnviewedNotification(accountId: string) {
  const row = await prisma.notification.findFirst({
    where: { accountId, isViewed: false },
    orderBy: { dateCreated: "desc" },
  });
  return row ? { ...row, content: parseNotificationContent(row.content) } : null;
}

export async function markNotificationViewed(accountId: string, notificationId: string) {
  const now = new Date();
  return prisma.notification.updateMany({
    where: { id: notificationId, accountId, isViewed: false },
    data: { isViewed: true, dateViewed: now },
  });
}

export async function claimComplimentaryGala({
  accountId,
  notificationId,
}: {
  accountId: string;
  notificationId: string;
}) {
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${notificationId}))`;
    const notification = await tx.notification.findFirst({
      where: { id: notificationId, accountId, type: "JURY" },
    });
    if (!notification) throw new Error("Notification not found.");
    const content = parseNotificationContent(notification.content);
    if (content.kind !== "JURY_GALA") throw new Error("This notification is not a Gala invitation.");

    const account = await tx.account.findFirst({
      where: { id: accountId, role: "JURY", status: "ACTIVE" },
      include: { juryProfile: true },
    });
    if (!account?.juryProfile) throw new Error("An active jury account is required.");

    let ticket = content.state.ticketId
      ? await tx.ticket.findFirst({ where: { id: content.state.ticketId, accountId } })
      : null;
    const now = new Date();
    if (!ticket) {
      ticket = await createComplimentaryGalaTicket(tx, {
        accountId,
        fullName: account.juryProfile.fullName,
        email: account.email,
        phone: account.juryProfile.phone ?? "Not provided",
        dataScope: account.dataScope,
      });
    }

    const nextContent = {
      ...content,
      state: {
        ...content.state,
        status: "ACCEPTED" as const,
        acceptedAt: content.state.acceptedAt ?? now.toISOString(),
        ticketId: ticket.id,
      },
    };
    await tx.notification.update({
      where: { id: notification.id },
      data: {
        content: nextContent as unknown as Prisma.InputJsonValue,
        isViewed: true,
        dateViewed: notification.dateViewed ?? now,
      },
    });
    return { notificationId: notification.id, ticket, content: nextContent };
  });

  const delivery = await sendJuryGalaQrEmail({
    to: result.ticket.email,
    fullName: result.ticket.fullName,
    secureToken: result.ticket.secureToken,
  });
  const emailDelivery = delivery.delivered ? "SENT" : "FAILED";
  const emailError = delivery.delivered
    ? null
    : delivery.error ?? delivery.reason ?? "Email delivery failed.";
  await prisma.notification.update({
    where: { id: result.notificationId },
    data: {
      content: {
        ...result.content,
        state: { ...result.content.state, emailDelivery, emailError },
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    delivered: delivery.delivered,
    ticketId: result.ticket.id,
    message: delivery.delivered
      ? "Your Gala Dinner QR code has been emailed to you."
      : "Your Gala Dinner ticket is ready, but the email could not be delivered. You can download the QR code here or retry the email.",
  };
}

export async function startSpecialOfferCheckout({
  accountId,
  notificationId,
  locale,
}: {
  accountId: string;
  notificationId: string;
  locale: Language;
}) {
  const price = await getSpecialOffer2DaysAmountFromStripe();
  const reservation = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${notificationId}))`;
    const notification = await tx.notification.findFirst({
      where: { id: notificationId, accountId, type: "APPLICANT" },
    });
    if (!notification) throw new Error("Notification not found.");
    const content = parseNotificationContent(notification.content);
    if (content.kind !== "SPECIAL_OFFER_2_DAYS") {
      throw new Error("This notification is not a special offer.");
    }
    if (content.state.status === "PURCHASED") {
      return { alreadyPurchased: true as const };
    }

    const account = await tx.account.findFirst({
      where: { id: accountId, role: "APPLICANT", status: "ACTIVE" },
      include: { applicantProfile: true },
    });
    if (!account?.applicantProfile) throw new Error("An active applicant account is required.");

    let ticket = content.state.ticketId
      ? await tx.ticket.findFirst({ where: { id: content.state.ticketId, accountId } })
      : null;
    let payment = content.state.paymentId
      ? await tx.payment.findFirst({ where: { id: content.state.paymentId, accountId } })
      : null;

    if (!ticket || !payment) {
      ticket = await createSpecialOfferTicket(tx, {
        accountId,
        applicantProfileId: account.applicantProfile.id,
        fullName: account.applicantProfile.fullName,
        email: account.email,
        phone: account.applicantProfile.phone ?? "Not provided",
        dataScope: account.dataScope,
      });
      payment = await tx.payment.create({
        data: {
          accountId,
          customerEmail: account.email,
          amount: price.amountCents,
          currency: price.currency,
          purchaseType: "TICKET",
          provider: "STRIPE",
          paymentPlan: "FULL",
          status: "PENDING",
          pricingSnapshot: {
            ticketId: ticket.id,
            notificationId,
            type: "TWO_DAYS",
            galaDinner: false,
            specialOffer: true,
          },
          dataScope: account.dataScope,
        },
      });
      await tx.ticket.update({ where: { id: ticket.id }, data: { paymentId: payment.id } });
      await tx.notification.update({
        where: { id: notification.id },
        data: {
          content: {
            ...content,
            state: { ...content.state, ticketId: ticket.id, paymentId: payment.id },
          } as unknown as Prisma.InputJsonValue,
        },
      });
    }

    return {
      alreadyPurchased: false as const,
      notification,
      content,
      ticket,
      payment,
      email: account.email,
    };
  });

  if (reservation.alreadyPurchased) return { alreadyPurchased: true as const };
  const session = await createSpecialOfferCheckoutSession({
    ticketId: reservation.ticket.id,
    paymentId: reservation.payment.id,
    notificationId,
    email: reservation.email,
    locale,
  });
  if (session.amountTotalCents !== price.amountCents || session.currency !== price.currency) {
    throw new Error("Stripe special-offer amount does not match the configured price.");
  }

  const now = new Date();
  const current = await prisma.notification.findFirst({ where: { id: notificationId, accountId } });
  if (!current) throw new Error("Notification not found after Checkout creation.");
  const content = parseNotificationContent(current.content);
  if (content.kind !== "SPECIAL_OFFER_2_DAYS") throw new Error("Notification type changed.");
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: reservation.payment.id },
      data: { stripeCheckoutSessionId: session.id },
    }),
    prisma.notification.update({
      where: { id: notificationId },
      data: {
        isViewed: true,
        dateViewed: current.dateViewed ?? now,
        content: {
          ...content,
          state: {
            ...content.state,
            status: "CHECKOUT_CREATED",
            checkoutCreatedAt: now.toISOString(),
            ticketId: reservation.ticket.id,
            paymentId: reservation.payment.id,
          },
        } as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);
  return { alreadyPurchased: false as const, checkoutUrl: session.url };
}

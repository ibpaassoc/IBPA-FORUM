import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/shared/lib/prisma";
import { getStripe } from "@/features/payments/server/stripe-client";
import { findSpecialPacketTickets, findTicketById } from "./ticket-repository";
import {
  createSpecialPacketCheckoutSession,
  createTicketCheckoutSession,
} from "./ticket-checkout";
import { getActiveTicketDiscount } from "./ticket-discount";
import { sendTicketPaymentLinkEmail } from "./ticket-email.workflow";
import { computeTicketAmountCents } from "@/features/tickets/lib/pricing";
import { isTicketPaymentConfirmed } from "@/features/tickets/lib/ticket-status";
import { syncTicketOnChange } from "@/features/google-sheets";
import type { Language } from "@/lib/i18n/translations";

export type ResendPaymentLinkResult =
  | { ok: true; checkoutUrl: string; reused: boolean }
  | { ok: false; reason: "not_found" | "already_paid"; checkoutUrl?: undefined }
  | { ok: false; reason: "email_failed"; checkoutUrl: string };

// Reuse an existing open session for repeated resends only when it is still
// comfortably in the future, so an about-to-expire link is never re-sent.
const REUSE_MIN_REMAINING_MS = 10 * 60 * 1000;

/**
 * Try to reuse the ticket's current Checkout Session for an idempotent resend.
 *
 * Reused only when the session is still open, unexpired with headroom, has a
 * usable URL, and its total exactly matches the freshly-recomputed price (so a
 * changed early-bird setting always forces a correctly-priced new session).
 * Any Stripe error degrades to "create a new session".
 */
async function tryReuseOpenSession(
  stripe: Stripe,
  sessionId: string | null,
  expectedTotalCents: number
): Promise<string | null> {
  if (!sessionId) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const expiresAtMs = (session.expires_at ?? 0) * 1000;
    const stillValid =
      session.status === "open" &&
      Boolean(session.url) &&
      expiresAtMs - Date.now() > REUSE_MIN_REMAINING_MS &&
      session.amount_total === expectedTotalCents;
    return stillValid ? session.url : null;
  } catch {
    return null;
  }
}

/**
 * Generate and send a fresh payment link for an unpaid ticket (admin action).
 *
 * The server independently re-verifies the ticket is unpaid, recomputes the
 * price from canonical server-side rules (never trusting the client), and issues
 * a new Stripe Checkout Session whose metadata lets the existing webhook mark the
 * correct ticket paid. A session is never created for a paid ticket, and creating
 * a session never marks the ticket paid — only the webhook does that.
 */
export async function resendTicketPaymentLink(
  ticketId: string,
  locale: Language
): Promise<ResendPaymentLinkResult> {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    return { ok: false, reason: "not_found" };
  }

  // Independent server-side guard: never issue a session for a confirmed-paid
  // ticket, and never for a canceled one.
  if (isTicketPaymentConfirmed(ticket.status)) {
    return { ok: false, reason: "already_paid" };
  }
  if (ticket.status !== "PENDING") {
    return { ok: false, reason: "not_found" };
  }

  if (ticket.specialPacketId) {
    const packetTickets = await findSpecialPacketTickets(ticket.specialPacketId);
    if (packetTickets.length !== 2 || packetTickets.some((item) => item.status !== "PENDING")) {
      return { ok: false, reason: "not_found" };
    }

    const primary = packetTickets[0];
    const ticketIds = packetTickets.map((item) => item.id) as [string, string];
    const session = await createSpecialPacketCheckoutSession({
      ticketIds,
      email: primary.email,
      isIbpaMember: primary.isIbpaMember,
      locale,
    });

    await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { specialPacketId: ticket.specialPacketId },
        data: { stripeSessionId: null },
      });
      await tx.ticket.update({
        where: { id: primary.id },
        data: { stripeSessionId: session.id },
      });
      await tx.payment.deleteMany({
        where: {
          ticket: { specialPacketId: ticket.specialPacketId },
          status: { not: "PAID" },
        },
      });
      await tx.payment.create({
        data: {
          source: "TICKET",
          ticketId: primary.id,
          stripeSessionId: session.id,
          amount: session.amountTotalCents,
          currency: "usd",
          purchaseManifest: { specialPacketId: ticket.specialPacketId, ticketIds },
          status: "PENDING",
        },
      });
    });

    ticketIds.forEach((id) => syncTicketOnChange(id));
    const emailResult = await sendTicketPaymentLinkEmail({
      to: primary.email,
      fullName: primary.fullName,
      type: primary.type,
      galaDinner: true,
      amountCents: session.amountTotalCents,
      currency: "usd",
      checkoutUrl: session.url,
    });

    return emailResult.delivered
      ? { ok: true, checkoutUrl: session.url, reused: false }
      : { ok: false, reason: "email_failed", checkoutUrl: session.url };
  }

  const activeTicketDiscount = await getActiveTicketDiscount();
  const amounts = computeTicketAmountCents({
    type: ticket.type,
    isIbpaMember: ticket.isIbpaMember,
    galaDinner: ticket.galaDinner,
    ticketDiscount: activeTicketDiscount?.discount ?? null,
  });

  const stripe = getStripe();

  // Idempotency: reuse the current open session for rapid repeat clicks; else
  // create a brand-new one and supersede the old (expired) reference.
  const reusedUrl = await tryReuseOpenSession(
    stripe,
    ticket.stripeSessionId,
    amounts.totalCents
  );

  let checkoutUrl: string;
  let reused: boolean;

  if (reusedUrl) {
    checkoutUrl = reusedUrl;
    reused = true;
  } else {
    const session = await createTicketCheckoutSession({
      ticketId: ticket.id,
      email: ticket.email,
      type: ticket.type,
      galaDinner: ticket.galaDinner,
      isIbpaMember: ticket.isIbpaMember,
      ticketAmountCents: activeTicketDiscount ? amounts.ticketCents : null,
      ticketDiscountLabel: activeTicketDiscount?.kind ?? null,
      locale,
    });

    // Supersede the old session reference and replace the pending payment so the
    // webhook (which matches on the new session id / metadata.ticketId) stays in
    // sync. Never touches a PAID payment.
    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { stripeSessionId: session.id },
      }),
      prisma.payment.deleteMany({
        where: { ticketId: ticket.id, status: { not: "PAID" } },
      }),
      prisma.payment.create({
        data: {
          source: "TICKET",
          ticketId: ticket.id,
          stripeSessionId: session.id,
          amount: amounts.totalCents,
          currency: "usd",
          status: "PENDING",
        },
      }),
    ]);

    checkoutUrl = session.url;
    reused = false;
    syncTicketOnChange(ticket.id);
  }

  const emailResult = await sendTicketPaymentLinkEmail({
    to: ticket.email,
    fullName: ticket.fullName,
    type: ticket.type,
    galaDinner: ticket.galaDinner,
    amountCents: amounts.totalCents,
    currency: "usd",
    checkoutUrl,
  });

  if (!emailResult.delivered) {
    console.error("Ticket payment-link email was not delivered", {
      ticketId: ticket.id,
      reason: emailResult.reason,
      error: emailResult.error,
    });
    // The session exists and is preserved (stored on the ticket); the admin can
    // retry sending and the open session will be reused. The ticket stays unpaid.
    return { ok: false, reason: "email_failed", checkoutUrl };
  }

  return { ok: true, checkoutUrl, reused };
}

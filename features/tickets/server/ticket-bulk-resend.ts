import "server-only";

import crypto from "node:crypto";
import { reserveRateLimitSlot } from "@/features/admin/lib/rate-limit";
import {
  TICKET_BULK_RESEND_CONCURRENCY,
  TICKET_BULK_RESEND_MAX_ATTEMPTS,
  TICKET_BULK_RESEND_MAX_STARTS_PER_SECOND,
  getTicketDeliveryRetryDelayMs,
  isRetryableTicketDelivery,
  type BulkTicketResendResult,
} from "@/features/tickets/lib/bulk-resend";
import { TICKET_CONFIRMED_STATUSES } from "@/features/tickets/lib/ticket-status";
import { prisma } from "@/shared/lib/prisma";
import { sendCurrentTicketQr } from "./ticket-admin-service";

type DeliveryOutcome = "sent" | "failed" | "skipped";

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function buildIdempotencyKey(runId: string, ticketId: string) {
  const digest = crypto
    .createHash("sha256")
    .update(`${runId}:${ticketId}`)
    .digest("hex");
  return `ticket-bulk-resend/${digest}`;
}

async function sendTicketWithRetry(ticketId: string, runId: string): Promise<DeliveryOutcome> {
  const idempotencyKey = buildIdempotencyKey(runId, ticketId);

  for (let attempt = 1; attempt <= TICKET_BULK_RESEND_MAX_ATTEMPTS; attempt += 1) {
    const result = await sendCurrentTicketQr(ticketId, {
      adminId: "bulk-ticket-resend",
      bulkRunId: runId,
      idempotencyKey,
    });

    if (result.ok) return "sent";
    if (result.reason !== "email_failed") return "skipped";
    if (
      attempt === TICKET_BULK_RESEND_MAX_ATTEMPTS ||
      !isRetryableTicketDelivery(result.delivery)
    ) {
      return "failed";
    }

    await wait(
      getTicketDeliveryRetryDelayMs({
        attempt,
        retryAfterSeconds: result.delivery.retryAfterSeconds,
      }),
    );
  }

  return "failed";
}

/**
 * Resends every confirmed forum ticket, including admin-generated tickets.
 * Admin tickets are stored with PAID status, so the confirmed-status query is
 * the authoritative scope for both purchased and manually issued tickets.
 */
export async function resendAllExistingTickets(runId: string): Promise<BulkTicketResendResult> {
  const tickets = await prisma.ticket.findMany({
    where: {
      kind: "FORUM",
      status: { in: [...TICKET_CONFIRMED_STATUSES] },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  const outcomes: DeliveryOutcome[] = new Array(tickets.length);
  let nextIndex = 0;
  let nextStartAt = 0;

  async function reserveStart() {
    const slot = reserveRateLimitSlot({
      now: Date.now(),
      nextStartAt,
      maxStartsPerSecond: TICKET_BULK_RESEND_MAX_STARTS_PER_SECOND,
    });
    nextStartAt = slot.nextStartAt;
    if (slot.delayMs > 0) await wait(slot.delayMs);
  }

  async function worker() {
    while (nextIndex < tickets.length) {
      const index = nextIndex;
      nextIndex += 1;

      try {
        await reserveStart();
        outcomes[index] = await sendTicketWithRetry(tickets[index].id, runId);
      } catch (error) {
        console.error("Bulk ticket resend failed for ticket.", {
          ticketId: tickets[index].id,
          runId,
          error,
        });
        outcomes[index] = "failed";
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(TICKET_BULK_RESEND_CONCURRENCY, tickets.length) },
      () => worker(),
    ),
  );

  return {
    runId,
    attempted: tickets.length,
    sent: outcomes.filter((outcome) => outcome === "sent").length,
    failed: outcomes.filter((outcome) => outcome === "failed").length,
    skipped: outcomes.filter((outcome) => outcome === "skipped").length,
  };
}

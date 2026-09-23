import type { TicketStatus } from "@prisma/client";
import { isTicketPaymentConfirmed } from "@/features/tickets/lib/ticket-status";

/** Keep provider request starts below Resend's default 10 requests/second. */
export const TICKET_BULK_RESEND_MAX_STARTS_PER_SECOND = 8;
export const TICKET_BULK_RESEND_CONCURRENCY = 4;
export const TICKET_BULK_RESEND_MAX_ATTEMPTS = 5;

export type BulkTicketResendResult = {
  runId: string;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
};

export function isBulkTicketResendEligible(status: TicketStatus) {
  return isTicketPaymentConfirmed(status);
}

export function isRetryableTicketDelivery(result: {
  providerErrorCode?: string;
  providerStatusCode?: number | null;
}) {
  if (
    result.providerErrorCode === "daily_quota_exceeded" ||
    result.providerErrorCode === "monthly_quota_exceeded"
  ) {
    return false;
  }
  return (
    result.providerErrorCode === "rate_limit_exceeded" ||
    result.providerErrorCode === "internal_server_error" ||
    result.providerErrorCode === "application_error" ||
    result.providerStatusCode === 429 ||
    (typeof result.providerStatusCode === "number" && result.providerStatusCode >= 500)
  );
}

export function getTicketDeliveryRetryDelayMs({
  attempt,
  retryAfterSeconds,
}: {
  attempt: number;
  retryAfterSeconds?: number;
}) {
  if (typeof retryAfterSeconds === "number" && retryAfterSeconds >= 0) {
    return Math.max(250, Math.ceil(retryAfterSeconds * 1000));
  }
  return Math.min(8_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TICKET_BULK_RESEND_CONCURRENCY,
  TICKET_BULK_RESEND_MAX_ATTEMPTS,
  TICKET_BULK_RESEND_MAX_STARTS_PER_SECOND,
  getTicketDeliveryRetryDelayMs,
  isBulkTicketResendEligible,
  isRetryableTicketDelivery,
} from "@/features/tickets/lib/bulk-resend";

assert.equal(isBulkTicketResendEligible("PAID"), true);
assert.equal(isBulkTicketResendEligible("CHECKED_ONE_DAY"), true);
assert.equal(isBulkTicketResendEligible("CHECKED_TWO_DAY"), true);
assert.equal(isBulkTicketResendEligible("CHECKED_GALA_DINNER"), true);
assert.equal(isBulkTicketResendEligible("PENDING"), false);
assert.equal(isBulkTicketResendEligible("CANCELED"), false);

assert.equal(TICKET_BULK_RESEND_MAX_STARTS_PER_SECOND, 8);
assert.ok(TICKET_BULK_RESEND_MAX_STARTS_PER_SECOND < 10);
assert.equal(TICKET_BULK_RESEND_CONCURRENCY, 4);
assert.equal(TICKET_BULK_RESEND_MAX_ATTEMPTS, 5);

assert.equal(
  isRetryableTicketDelivery({ providerErrorCode: "rate_limit_exceeded", providerStatusCode: 429 }),
  true,
);
assert.equal(
  isRetryableTicketDelivery({ providerErrorCode: "daily_quota_exceeded", providerStatusCode: 429 }),
  false,
  "account quota exhaustion is not a transient per-second rate limit",
);
assert.equal(
  isRetryableTicketDelivery({ providerErrorCode: "validation_error", providerStatusCode: 400 }),
  false,
);
assert.equal(getTicketDeliveryRetryDelayMs({ attempt: 1 }), 1_000);
assert.equal(getTicketDeliveryRetryDelayMs({ attempt: 4 }), 8_000);
assert.equal(
  getTicketDeliveryRetryDelayMs({ attempt: 1, retryAfterSeconds: 2.5 }),
  2_500,
);

const serviceSource = readFileSync(
  join(process.cwd(), "features/tickets/server/ticket-bulk-resend.ts"),
  "utf8",
);
assert.match(serviceSource, /status: \{ in: \[\.\.\.TICKET_CONFIRMED_STATUSES\] \}/);
assert.match(serviceSource, /idempotencyKey/);
assert.match(serviceSource, /reserveRateLimitSlot/);

const routeSource = readFileSync(
  join(process.cwd(), "app/api/admin/tickets/resend-all/route.ts"),
  "utf8",
);
assert.match(routeSource, /isAdminAuthenticated/);
assert.match(routeSource, /export const maxDuration = 300/);

const emailSource = readFileSync(
  join(process.cwd(), "features/email/server/send-email.ts"),
  "utf8",
);
assert.match(emailSource, /\{ idempotencyKey: input\.idempotencyKey \}/);
assert.match(emailSource, /result\.headers\?\.\["retry-after"\]/);

console.log("Ticket bulk resend validation passed.");

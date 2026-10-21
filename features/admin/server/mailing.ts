import "server-only";

import crypto from "node:crypto";
import type { Prisma, TicketType } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationValues } from "@/features/applications/types/application.types";
import {
  parseNominationAnswers,
  parseStoredFiles,
  parseTicketActivity,
} from "@/features/database/json-fields";
import { sendEmail, type SendEmailResult } from "@/features/email/server/send-email";
import {
  averageCompletion,
  buildAdminMailingEmail,
  deduplicateRecipientsByEmail,
  getRegistrationState,
  MAILING_ELIGIBLE_JURY_STATUSES,
  parseRecipientRef,
  splitRecipientRefs,
  toRecipientRef,
  type MailingFormValues,
  type MailingOutcome,
  type MailingRecipientGroup,
} from "@/features/admin/lib/mailing";
import { reserveRateLimitSlot } from "@/features/admin/lib/rate-limit";
import {
  getTicketDeliveryRetryDelayMs,
  isRetryableTicketDelivery,
} from "@/features/tickets/lib/bulk-resend";
import { isGalaOnlyOrigin, ticketTypeLabel } from "@/features/tickets/lib/labels";
import { TICKET_CONFIRMED_STATUSES } from "@/features/tickets/lib/ticket-status";
import { prisma } from "@/shared/lib/prisma";

export type MailingTicketInfo = {
  /** Issued by an admin (stored as PAID without a checkout) or bought online. */
  source: "ADMIN" | "PAID";
  label: string;
  type: TicketType | null;
  galaOnly: boolean;
  checkedIn: boolean;
};

export type MailingRecipient = {
  /** `account:<id>` or `ticket:<id>`; the unit the client selects and sends. */
  ref: string;
  group: MailingRecipientGroup;
  fullName: string;
  email: string;
  registrationState: ReturnType<typeof getRegistrationState> | null;
  selectable: boolean;
  completionPercentage: number | null;
  nominationCount: number;
  ticket: MailingTicketInfo | null;
};

const SEND_CONCURRENCY = 4;
const SEND_STARTS_PER_SECOND = 8;
const SEND_MAX_ATTEMPTS = 4;

function nominationCompletion(nomination: {
  category: { slug: string };
  answers: unknown;
  files: unknown;
}) {
  const values: ApplicationValues = {};
  for (const answer of parseNominationAnswers(nomination.answers).fields) {
    values[answer.fieldId] = answer.value as ApplicationValues[string];
  }

  const storedFiles = parseStoredFiles(nomination.files).items;
  const fileKeys = new Set(storedFiles.map((file) => file.fieldId));
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const requiredFields = fields.filter(
    (field) => field.required && getFieldVisibility(field, values),
  );
  const completed = requiredFields.filter((field) => {
    if (field.type === "file") return fileKeys.has(field.key);
    const value = values[field.key];
    if (Array.isArray(value)) return value.length > 0;
    return String(value ?? "").trim().length > 0;
  }).length;

  return requiredFields.length === 0
    ? 100
    : Math.round((completed / requiredFields.length) * 100);
}

/** Applicants, plus jury whose application was approved (or already paid). */
function mailingAccountWhere(ids?: string[]): Prisma.AccountWhereInput {
  return {
    ...(ids ? { id: { in: ids }, status: { not: "DISABLED" } } : {}),
    OR: [
      { role: "APPLICANT" },
      {
        role: "JURY",
        juryApplication: {
          status: { in: [...MAILING_ELIGIBLE_JURY_STATUSES] },
        },
      },
    ],
  };
}

/** Paid tickets and admin-issued ones: both end up in a confirmed status. */
function mailingTicketWhere(ids?: string[]): Prisma.TicketWhereInput {
  return {
    ...(ids ? { id: { in: ids } } : {}),
    status: { in: [...TICKET_CONFIRMED_STATUSES] },
  };
}

function ticketSource(activity: unknown): MailingTicketInfo["source"] {
  try {
    return parseTicketActivity(activity).events.some(
      (event) => event.type === "CREATED_MANUALLY",
    )
      ? "ADMIN"
      : "PAID";
  } catch {
    return "PAID";
  }
}

async function getAccountRecipients(): Promise<MailingRecipient[]> {
  const accounts = await prisma.account.findMany({
    where: mailingAccountWhere(),
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      passwordHash: true,
      applicantProfile: {
        select: {
          fullName: true,
          nominations: {
            where: { status: { not: "ARCHIVED" } },
            orderBy: { createdAt: "asc" },
            select: {
              category: { select: { slug: true } },
              answers: true,
              files: true,
            },
          },
        },
      },
      juryProfile: { select: { fullName: true } },
      juryApplication: { select: { fullName: true } },
    },
  });

  return accounts.map((account) => {
    const nominations = account.applicantProfile?.nominations ?? [];
    const isApplicant = account.role === "APPLICANT";

    return {
      ref: toRecipientRef("account", account.id),
      group: isApplicant ? "APPLICANT" : "JURY",
      fullName:
        account.applicantProfile?.fullName ??
        account.juryProfile?.fullName ??
        account.juryApplication?.fullName ??
        account.email,
      email: account.email,
      registrationState: getRegistrationState(account),
      selectable: account.status !== "DISABLED",
      completionPercentage: isApplicant
        ? averageCompletion(nominations.map(nominationCompletion))
        : null,
      nominationCount: nominations.length,
      ticket: null,
    };
  });
}

async function getTicketRecipients(): Promise<MailingRecipient[]> {
  const tickets = await prisma.ticket.findMany({
    where: mailingTicketWhere(),
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      origin: true,
      type: true,
      galaDinner: true,
      status: true,
      activity: true,
    },
  });

  return tickets
    .filter((ticket) => ticket.email.trim().length > 0)
    .map((ticket) => {
      const galaOnly = isGalaOnlyOrigin(ticket.origin);
      const label = galaOnly
        ? "Gala Dinner"
        : `${ticket.type ? ticketTypeLabel(ticket.type) : "Forum Pass"}${
            ticket.galaDinner ? " + Gala" : ""
          }`;

      return {
        ref: toRecipientRef("ticket", ticket.id),
        group: "TICKET" as const,
        fullName: ticket.fullName.trim() || ticket.email,
        email: ticket.email.trim(),
        registrationState: null,
        selectable: true,
        completionPercentage: null,
        nominationCount: 0,
        ticket: {
          source: ticketSource(ticket.activity),
          label,
          type: galaOnly ? null : ticket.type,
          galaOnly,
          checkedIn: ticket.status !== "PAID",
        },
      };
    });
}

export async function getMailingRecipients() {
  const [accounts, tickets] = await Promise.all([
    getAccountRecipients(),
    getTicketRecipients(),
  ]);

  return {
    applicants: accounts.filter((recipient) => recipient.group === "APPLICANT"),
    jury: accounts.filter((recipient) => recipient.group === "JURY"),
    tickets,
  };
}

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function mailingIdempotencyKey(runId: string, email: string) {
  const digest = crypto
    .createHash("sha256")
    .update(`${runId}:${email.trim().toLowerCase()}`)
    .digest("hex");
  return `admin-mailing/${digest}`;
}

/**
 * Retries only provider throttling/outages, and only when the request carries
 * an idempotency key, so an unclear failure can never deliver a second copy.
 */
async function deliverWithRetry(
  send: (idempotencyKey: string | undefined) => Promise<SendEmailResult>,
  idempotencyKey: string | undefined,
) {
  let result = await send(idempotencyKey);
  for (
    let attempt = 1;
    attempt < SEND_MAX_ATTEMPTS &&
    idempotencyKey &&
    !result.delivered &&
    isRetryableTicketDelivery(result);
    attempt += 1
  ) {
    await wait(
      getTicketDeliveryRetryDelayMs({
        attempt,
        retryAfterSeconds: result.retryAfterSeconds,
      }),
    );
    result = await send(idempotencyKey);
  }
  return result;
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  maxStartsPerSecond: number,
  task: (item: T) => Promise<SendEmailResult>,
) {
  const results: SendEmailResult[] = new Array(items.length);
  let nextIndex = 0;
  let nextStartAt = 0;

  async function waitForStartSlot() {
    // Slot reservation is synchronous before the await, so concurrent workers
    // cannot claim the same instant. Keep headroom below Resend's 10 req/s cap.
    const slot = reserveRateLimitSlot({
      now: Date.now(),
      nextStartAt,
      maxStartsPerSecond,
    });
    nextStartAt = slot.nextStartAt;
    if (slot.delayMs > 0) await wait(slot.delayMs);
  }

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        await waitForStartSlot();
        results[index] = await task(items[index]);
      } catch (error) {
        results[index] = {
          delivered: false,
          reason: "resend_error",
          error: error instanceof Error ? error.message : "Unknown email error.",
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

type MailingTarget = { ref: string; email: string; entity: { type: string; id: string } };

async function resolveTargets(refs: string[]) {
  const { accountIds, ticketIds } = splitRecipientRefs(refs);
  const [accounts, tickets] = await Promise.all([
    accountIds.length
      ? prisma.account.findMany({
          where: mailingAccountWhere(accountIds),
          select: { id: true, email: true },
        })
      : [],
    ticketIds.length
      ? prisma.ticket.findMany({
          where: mailingTicketWhere(ticketIds),
          select: { id: true, email: true },
        })
      : [],
  ]);

  const byRef = new Map<string, MailingTarget>();
  for (const account of accounts) {
    const ref = toRecipientRef("account", account.id);
    byRef.set(ref, { ref, email: account.email, entity: { type: "Account", id: account.id } });
  }
  for (const ticket of tickets) {
    const ref = toRecipientRef("ticket", ticket.id);
    byRef.set(ref, {
      ref,
      email: ticket.email.trim(),
      entity: { type: "Ticket", id: ticket.id },
    });
  }
  return byRef;
}

export async function sendAdminMailing(
  values: MailingFormValues,
): Promise<MailingOutcome[]> {
  const targetsByRef = await resolveTargets(values.recipientIds);
  const outcomes = new Map<string, MailingOutcome>();

  const eligible: MailingTarget[] = [];
  for (const ref of values.recipientIds) {
    const target = parseRecipientRef(ref) ? targetsByRef.get(ref) : undefined;
    if (!target || !target.email) {
      outcomes.set(ref, { ref, status: "skipped", reason: "Получатель недоступен." });
      continue;
    }
    eligible.push(target);
  }

  const unique = deduplicateRecipientsByEmail(eligible);
  const uniqueRefs = new Set(unique.map((target) => target.ref));
  for (const target of eligible) {
    if (!uniqueRefs.has(target.ref)) {
      outcomes.set(target.ref, {
        ref: target.ref,
        status: "skipped",
        reason: "Тот же адрес уже в рассылке.",
      });
    }
  }

  const email = buildAdminMailingEmail(values);
  const results = await runWithConcurrency(
    unique,
    SEND_CONCURRENCY,
    SEND_STARTS_PER_SECOND,
    (target) =>
      deliverWithRetry(
        (idempotencyKey) =>
          sendEmail({
            type: "user",
            to: target.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            templateType: "admin_mailing",
            category: "admin",
            relatedEntity: target.entity,
            idempotencyKey,
          }),
        values.runId ? mailingIdempotencyKey(values.runId, target.email) : undefined,
      ),
  );

  unique.forEach((target, index) => {
    const result = results[index];
    outcomes.set(
      target.ref,
      result.delivered
        ? { ref: target.ref, status: "sent" }
        : {
            ref: target.ref,
            status: "failed",
            reason: result.error ?? "Не удалось доставить письмо.",
          },
    );
  });

  return values.recipientIds.map((ref) => outcomes.get(ref)!);
}

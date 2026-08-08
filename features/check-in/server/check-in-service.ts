import "server-only";

import crypto from "crypto";
import { Prisma, type Ticket } from "@prisma/client";
import { parseTicketActivity } from "@/features/database/json-fields";
import { syncCheckInOnChange } from "@/features/google-sheets";
import { adminT } from "@/lib/i18n/admin";
import { prisma } from "@/shared/lib/prisma";
import { buildScanPayload, parseScanCode } from "./scan-code";
import type {
  CheckInScope,
  CheckInScopeState,
  NormalizedTicket,
  TicketKind,
} from "../types";

const TICKET_TYPE_LABELS: Record<string, string> = {
  ONE_DAY: "Форум — 1 день",
  TWO_DAYS: "Форум — 2 дня",
};

export type CheckInError =
  | { ok: false; code: "INVALID_CODE"; status: 400; message: string }
  | { ok: false; code: "NOT_FOUND"; status: 404; message: string }
  | { ok: false; code: "QR_REPLACED"; status: 410; message: string }
  | { ok: false; code: "NOT_PAID"; status: 422; message: string }
  | { ok: false; code: "ALREADY_CHECKED_IN"; status: 409; message: string; checkedInAt: string }
  | { ok: false; code: "BAD_SCOPE"; status: 400; message: string };

export type ResolveResult =
  | { ok: true; ticket: NormalizedTicket }
  | Extract<CheckInError, { code: "INVALID_CODE" | "NOT_FOUND" | "QR_REPLACED" }>;

export type CheckInResult = { ok: true; ticket: NormalizedTicket } | CheckInError;

function ticketEligible(status: string) {
  return status !== "PENDING" && status !== "CANCELED";
}

function externalKind(ticket: Ticket): TicketKind {
  return ticket.kind === "APPLICANT" ? "PARTICIPANT" : ticket.kind === "JURY" ? "JURY" : "TICKET";
}

function normalizeForumTicket(ticket: Ticket): NormalizedTicket {
  const dayOneCheckedInAt = ticket.dayOneCheckInAt ?? ticket.forumCheckInAt;
  const dayTwoCheckedInAt = ticket.dayTwoCheckInAt;
  const isOneDayPass = ticket.type === "ONE_DAY";
  const dayOneAvailable = !isOneDayPass || !dayTwoCheckedInAt;
  const dayTwoAvailable = !isOneDayPass || !dayOneCheckedInAt;
  const scopes: CheckInScopeState[] = [
    {
      scope: "DAY_ONE",
      label: adminT.scanner.dayOne,
      checkedInAt: dayOneCheckedInAt?.toISOString() ?? null,
      available: dayOneAvailable,
      unavailableReason: dayOneAvailable ? null : adminT.scanner.oneDayPassUsed,
    },
    {
      scope: "DAY_TWO",
      label: adminT.scanner.dayTwo,
      checkedInAt: dayTwoCheckedInAt?.toISOString() ?? null,
      available: dayTwoAvailable,
      unavailableReason: dayTwoAvailable ? null : adminT.scanner.oneDayPassUsed,
    },
    {
      scope: "GALA",
      label: adminT.scanner.galaDinner,
      checkedInAt: ticket.galaCheckInAt?.toISOString() ?? null,
      available: ticket.galaDinner,
      unavailableReason: ticket.galaDinner ? null : adminT.scanner.notIncluded,
    },
  ];
  return {
    ticketKind: "TICKET",
    ticketType: ticket.type ? TICKET_TYPE_LABELS[ticket.type] ?? ticket.type : "Forum ticket",
    ownerName: ticket.fullName,
    email: ticket.email,
    phone: ticket.phone,
    status: ticket.status,
    paymentStatus: ticketEligible(ticket.status) ? "PAID" : "PENDING",
    checkInStatus: scopes.some((scope) => scope.checkedInAt) ? "CHECKED_IN" : "NOT_CHECKED_IN",
    scopes,
    galaDinnerIncluded: ticket.galaDinner,
    eligibleForCheckIn: ticketEligible(ticket.status),
    sourceRecordId: ticket.id,
    code: buildScanPayload("TICKET", ticket.secureToken),
  };
}

function normalizeAttendanceTicket(ticket: Ticket): NormalizedTicket {
  const kind = externalKind(ticket);
  return {
    ticketKind: kind,
    ticketType: kind === "JURY" ? "Член жюри" : "Участник премии",
    ownerName: ticket.fullName,
    email: ticket.email,
    phone: ticket.phone,
    status: ticket.status,
    paymentStatus: ticketEligible(ticket.status) ? "PAID" : "PENDING",
    checkInStatus: ticket.lastCheckIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
    scopes: [
      {
        scope: "ATTENDANCE",
        label: "Посещение мероприятия",
        checkedInAt: ticket.lastCheckIn?.toISOString() ?? null,
        available: true,
        unavailableReason: null,
      },
    ],
    galaDinnerIncluded: null,
    eligibleForCheckIn: ticketEligible(ticket.status),
    sourceRecordId: ticket.id,
    code: buildScanPayload(kind, ticket.secureToken),
  };
}

function normalizeTicket(ticket: Ticket) {
  return ticket.kind === "FORUM" ? normalizeForumTicket(ticket) : normalizeAttendanceTicket(ticket);
}

type LookupResult =
  | { kind: "found"; ticket: NormalizedTicket }
  | { kind: "replaced" }
  | { kind: "missing" };

function databaseKind(kind: TicketKind) {
  return kind === "PARTICIPANT" ? "APPLICANT" : kind === "TICKET" ? "FORUM" : "JURY";
}

async function findByKind(kind: TicketKind, token: string): Promise<LookupResult> {
  const ticket = await prisma.ticket.findFirst({
    where: { kind: databaseKind(kind), secureToken: token },
  });
  if (ticket) return { kind: "found", ticket: normalizeTicket(ticket) };

  const replaced = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id FROM forum_next."Ticket"
    WHERE kind::text = ${databaseKind(kind)}
      AND credential->'history' @> ${JSON.stringify([{ token }])}::jsonb
    LIMIT 1
  `);
  return replaced.length > 0 ? { kind: "replaced" } : { kind: "missing" };
}

export async function resolveScan(rawCode: unknown): Promise<ResolveResult> {
  const parsed = parseScanCode(rawCode);
  if (!parsed) {
    return { ok: false, code: "INVALID_CODE", status: 400, message: "Этот QR-код не является билетом IBPA." };
  }
  let resolved: NormalizedTicket | null = null;
  let replaced = false;
  const kinds = parsed.kind ? [parsed.kind] : (["TICKET", "PARTICIPANT", "JURY"] as const);
  for (const kind of kinds) {
    const result = await findByKind(kind, parsed.token);
    if (result.kind === "found") {
      resolved = result.ticket;
      break;
    }
    if (result.kind === "replaced") {
      replaced = true;
      break;
    }
  }
  if (replaced) {
    return { ok: false, code: "QR_REPLACED", status: 410, message: "Этот QR-код был заменён. Используйте новый QR-код клиента." };
  }
  if (!resolved) {
    return { ok: false, code: "NOT_FOUND", status: 404, message: "Билет с таким кодом не найден." };
  }
  return { ok: true, ticket: resolved };
}

function alreadyCheckedIn(ticket: Ticket, scope: CheckInScope) {
  if (ticket.kind !== "FORUM") return ticket.lastCheckIn;
  return scope === "GALA"
    ? ticket.galaCheckInAt
    : scope === "DAY_TWO"
      ? ticket.dayTwoCheckInAt
      : ticket.dayOneCheckInAt ?? ticket.forumCheckInAt;
}

function validateScope(ticket: Ticket, scope: CheckInScope): CheckInError | null {
  if (!ticketEligible(ticket.status)) {
    return { ok: false, code: "NOT_PAID", status: 422, message: "Билет не оплачен — чек-ин невозможен." };
  }
  if (ticket.kind !== "FORUM") {
    return scope === "ATTENDANCE"
      ? null
      : { ok: false, code: "BAD_SCOPE", status: 400, message: "Недопустимый тип чек-ина." };
  }
  if (scope !== "DAY_ONE" && scope !== "DAY_TWO" && scope !== "GALA") {
    return { ok: false, code: "BAD_SCOPE", status: 400, message: "Недопустимый тип чек-ина." };
  }
  if (scope === "GALA" && !ticket.galaDinner) {
    return { ok: false, code: "BAD_SCOPE", status: 400, message: "Этот билет не включает гала-ужин." };
  }
  const opposite =
    scope === "DAY_ONE"
      ? ticket.dayTwoCheckInAt
      : scope === "DAY_TWO"
        ? ticket.dayOneCheckInAt ?? ticket.forumCheckInAt
        : null;
  if (ticket.type === "ONE_DAY" && opposite) {
    return { ok: false, code: "BAD_SCOPE", status: 400, message: adminT.scanner.oneDayPassUsed };
  }
  return null;
}

async function runCheckIn(input: {
  ticketKind: TicketKind;
  sourceRecordId: string;
  scope: CheckInScope;
}): Promise<CheckInResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.sourceRecordId}))`;
    const ticket = await tx.ticket.findFirst({
      where: { id: input.sourceRecordId, kind: databaseKind(input.ticketKind) },
    });
    if (!ticket) {
      return { ok: false, code: "NOT_FOUND", status: 404, message: "Билет не найден." } as const;
    }
    const invalid = validateScope(ticket, input.scope);
    if (invalid) return invalid;
    const existing = alreadyCheckedIn(ticket, input.scope);
    if (existing) {
      return {
        ok: false,
        code: "ALREADY_CHECKED_IN",
        status: 409,
        message: adminT.scanner.alreadyCheckedIn,
        checkedInAt: existing.toISOString(),
      } as const;
    }

    const now = new Date();
    const activity = parseTicketActivity(ticket.activity);
    const nextActivity = {
      ...activity,
      events: [
        ...activity.events,
        {
          id: crypto.randomUUID(),
          type: "CHECKED_IN",
          createdAt: now.toISOString(),
          scope: input.scope,
        },
      ],
    };
    const status =
      ticket.kind !== "FORUM"
        ? ticket.status
        : input.scope === "GALA"
          ? "CHECKED_GALA_DINNER"
          : input.scope === "DAY_TWO"
            ? "CHECKED_TWO_DAY"
            : "CHECKED_ONE_DAY";
    const updated = await tx.ticket.update({
      where: { id: ticket.id },
      data: {
        status,
        lastCheckIn: now,
        activity: nextActivity as unknown as Prisma.InputJsonValue,
        revision: { increment: 1 },
        ...(ticket.kind === "FORUM"
          ? input.scope === "GALA"
            ? { galaCheckInAt: now }
            : input.scope === "DAY_TWO"
              ? { dayTwoCheckInAt: now }
              : { dayOneCheckInAt: now, forumCheckInAt: now }
          : {}),
      },
    });
    return { ok: true, ticket: normalizeTicket(updated) } as const;
  });
}

export async function performCheckIn(input: {
  ticketKind: TicketKind;
  sourceRecordId: string;
  scope: CheckInScope;
}): Promise<CheckInResult> {
  const result = await runCheckIn(input);
  if (result.ok) syncCheckInOnChange({ kind: input.ticketKind, id: input.sourceRecordId });
  return result;
}

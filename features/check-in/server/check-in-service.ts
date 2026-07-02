import "server-only";
import { prisma } from "@/shared/lib/prisma";
import type { Application, JuryApplication, Ticket } from "@prisma/client";
import { syncCheckInOnChange } from "@/features/google-sheets";
import { parseScanCode, buildScanPayload } from "./scan-code";
import type {
  CheckInScope,
  CheckInScopeState,
  NormalizedTicket,
  PaymentStatusValue,
  TicketKind,
} from "../types";

// Ярлыки для админ-сканера — единственного потребителя этих данных.
const TICKET_TYPE_LABELS: Record<string, string> = {
  ONE_DAY: "Форум — 1 день",
  TWO_DAYS: "Форум — 2 дня",
};

export type CheckInError =
  | { ok: false; code: "INVALID_CODE"; status: 400; message: string }
  | { ok: false; code: "NOT_FOUND"; status: 404; message: string }
  | { ok: false; code: "NOT_PAID"; status: 422; message: string }
  | { ok: false; code: "ALREADY_CHECKED_IN"; status: 409; message: string; checkedInAt: string }
  | { ok: false; code: "BAD_SCOPE"; status: 400; message: string };

export type ResolveResult =
  | { ok: true; ticket: NormalizedTicket }
  | Extract<CheckInError, { code: "INVALID_CODE" | "NOT_FOUND" }>;

export type CheckInResult =
  | { ok: true; ticket: NormalizedTicket }
  | CheckInError;

// ─── Normalizers ─────────────────────────────────────────────────────────────

function ticketEligible(status: string) {
  return status !== "PENDING" && status !== "CANCELED";
}

function normalizeTicket(ticket: Ticket): NormalizedTicket {
  const scopes: CheckInScopeState[] = [
    {
      scope: "FORUM",
      label: TICKET_TYPE_LABELS[ticket.type] ?? "Форум",
      checkedInAt: ticket.forumCheckInAt?.toISOString() ?? null,
    },
  ];
  if (ticket.galaDinner) {
    scopes.push({
      scope: "GALA",
      label: "Гала-ужин",
      checkedInAt: ticket.galaCheckInAt?.toISOString() ?? null,
    });
  }

  const checkedIn = scopes.some((s) => s.checkedInAt !== null);

  return {
    ticketKind: "TICKET",
    ticketType: TICKET_TYPE_LABELS[ticket.type] ?? ticket.type,
    ownerName: ticket.fullName,
    email: ticket.email,
    phone: ticket.phone,
    status: ticket.status,
    paymentStatus: ticketEligible(ticket.status) ? "PAID" : "PENDING",
    checkInStatus: checkedIn ? "CHECKED_IN" : "NOT_CHECKED_IN",
    scopes,
    eligibleForCheckIn: ticketEligible(ticket.status),
    sourceRecordId: ticket.id,
    code: buildScanPayload("TICKET", ticket.secureToken),
  };
}

function normalizeApplication(app: Application): NormalizedTicket {
  const paid = app.paymentStatus === "PAID";
  return {
    ticketKind: "PARTICIPANT",
    ticketType: "Участник премии",
    ownerName: app.fullName,
    email: app.email,
    phone: app.phone,
    status: app.status,
    paymentStatus: app.paymentStatus as PaymentStatusValue,
    checkInStatus: app.checkedInAt ? "CHECKED_IN" : "NOT_CHECKED_IN",
    scopes: [
      {
        scope: "ATTENDANCE",
        label: "Посещение мероприятия",
        checkedInAt: app.checkedInAt?.toISOString() ?? null,
      },
    ],
    eligibleForCheckIn: paid,
    sourceRecordId: app.id,
    code: buildScanPayload("PARTICIPANT", app.id),
  };
}

function normalizeJury(jury: JuryApplication): NormalizedTicket {
  const paid = jury.paymentStatus === "PAID" || jury.status === "PAID";
  return {
    ticketKind: "JURY",
    ticketType: "Член жюри",
    ownerName: jury.fullName,
    email: jury.email,
    phone: jury.phone,
    status: jury.status,
    paymentStatus: jury.paymentStatus as PaymentStatusValue,
    checkInStatus: jury.checkedInAt ? "CHECKED_IN" : "NOT_CHECKED_IN",
    scopes: [
      {
        scope: "ATTENDANCE",
        label: "Посещение мероприятия",
        checkedInAt: jury.checkedInAt?.toISOString() ?? null,
      },
    ],
    eligibleForCheckIn: paid,
    sourceRecordId: jury.id,
    code: buildScanPayload("JURY", jury.id),
  };
}

// ─── Lookup ──────────────────────────────────────────────────────────────────

async function findByKind(
  kind: TicketKind,
  token: string,
): Promise<NormalizedTicket | null> {
  switch (kind) {
    case "TICKET": {
      const ticket = await prisma.ticket.findUnique({ where: { secureToken: token } });
      return ticket ? normalizeTicket(ticket) : null;
    }
    case "PARTICIPANT": {
      const app = await prisma.application.findUnique({ where: { id: token } });
      return app ? normalizeApplication(app) : null;
    }
    case "JURY": {
      const jury = await prisma.juryApplication.findUnique({ where: { id: token } });
      return jury ? normalizeJury(jury) : null;
    }
  }
}

/**
 * Resolve a scanned QR string to a normalized ticket, searching across every
 * ticket-like source. When the kind is unknown (bare token) each source is
 * tried in turn.
 */
export async function resolveScan(rawCode: unknown): Promise<ResolveResult> {
  const parsed = parseScanCode(rawCode);
  if (!parsed) {
    return {
      ok: false,
      code: "INVALID_CODE",
      status: 400,
      message: "Этот QR-код не является билетом IBPA.",
    };
  }

  if (parsed.kind) {
    const ticket = await findByKind(parsed.kind, parsed.token);
    if (ticket) return { ok: true, ticket };
  } else {
    for (const kind of ["TICKET", "PARTICIPANT", "JURY"] as const) {
      const ticket = await findByKind(kind, parsed.token);
      if (ticket) return { ok: true, ticket };
    }
  }

  return {
    ok: false,
    code: "NOT_FOUND",
    status: 404,
    message: "Билет с таким кодом не найден.",
  };
}

// ─── Check-in ────────────────────────────────────────────────────────────────

async function checkInTicketRecord(
  recordId: string,
  scope: CheckInScope,
): Promise<CheckInResult> {
  const ticket = await prisma.ticket.findUnique({ where: { id: recordId } });
  if (!ticket) {
    return { ok: false, code: "NOT_FOUND", status: 404, message: "Билет не найден." };
  }
  if (!ticketEligible(ticket.status)) {
    return {
      ok: false,
      code: "NOT_PAID",
      status: 422,
      message: "Билет не оплачен — чек-ин невозможен.",
    };
  }
  if (scope !== "FORUM" && scope !== "GALA") {
    return { ok: false, code: "BAD_SCOPE", status: 400, message: "Недопустимый тип чек-ина для этого билета." };
  }
  if (scope === "GALA" && !ticket.galaDinner) {
    return {
      ok: false,
      code: "BAD_SCOPE",
      status: 400,
      message: "Этот билет не включает гала-ужин.",
    };
  }

  const existing = scope === "GALA" ? ticket.galaCheckInAt : ticket.forumCheckInAt;
  if (existing) {
    return {
      ok: false,
      code: "ALREADY_CHECKED_IN",
      status: 409,
      message: `Гость уже отмечен ${scope === "GALA" ? "на гала-ужине" : "на форуме"}.`,
      checkedInAt: existing.toISOString(),
    };
  }

  const now = new Date();
  // Keep the legacy single-status field in sync for the existing tickets table.
  const legacyStatus =
    scope === "GALA"
      ? "CHECKED_GALA_DINNER"
      : ticket.type === "TWO_DAYS"
        ? "CHECKED_TWO_DAY"
        : "CHECKED_ONE_DAY";

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      ...(scope === "GALA" ? { galaCheckInAt: now } : { forumCheckInAt: now }),
      status: legacyStatus,
      lastCheckIn: now,
    },
  });

  return { ok: true, ticket: normalizeTicket(updated) };
}

async function checkInApplicationRecord(recordId: string): Promise<CheckInResult> {
  const app = await prisma.application.findUnique({ where: { id: recordId } });
  if (!app) {
    return { ok: false, code: "NOT_FOUND", status: 404, message: "Заявка не найдена." };
  }
  if (app.paymentStatus !== "PAID") {
    return {
      ok: false,
      code: "NOT_PAID",
      status: 422,
      message: "Участник не оплатил участие — чек-ин невозможен.",
    };
  }
  if (app.checkedInAt) {
    return {
      ok: false,
      code: "ALREADY_CHECKED_IN",
      status: 409,
      message: "Этот участник уже отмечен.",
      checkedInAt: app.checkedInAt.toISOString(),
    };
  }
  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { checkedInAt: new Date() },
  });
  return { ok: true, ticket: normalizeApplication(updated) };
}

async function checkInJuryRecord(recordId: string): Promise<CheckInResult> {
  const jury = await prisma.juryApplication.findUnique({ where: { id: recordId } });
  if (!jury) {
    return { ok: false, code: "NOT_FOUND", status: 404, message: "Член жюри не найден." };
  }
  if (jury.paymentStatus !== "PAID" && jury.status !== "PAID") {
    return {
      ok: false,
      code: "NOT_PAID",
      status: 422,
      message: "Член жюри не завершил оплату — чек-ин невозможен.",
    };
  }
  if (jury.checkedInAt) {
    return {
      ok: false,
      code: "ALREADY_CHECKED_IN",
      status: 409,
      message: "Этот член жюри уже отмечен.",
      checkedInAt: jury.checkedInAt.toISOString(),
    };
  }
  const updated = await prisma.juryApplication.update({
    where: { id: jury.id },
    data: { checkedInAt: new Date() },
  });
  return { ok: true, ticket: normalizeJury(updated) };
}

export async function performCheckIn(input: {
  ticketKind: TicketKind;
  sourceRecordId: string;
  scope: CheckInScope;
}): Promise<CheckInResult> {
  const result = await runCheckIn(input);

  // Mirror the freshly checked-in record into Google Sheets (non-blocking).
  if (result.ok) {
    syncCheckInOnChange({ kind: input.ticketKind, id: input.sourceRecordId });
  }

  return result;
}

function runCheckIn(input: {
  ticketKind: TicketKind;
  sourceRecordId: string;
  scope: CheckInScope;
}): Promise<CheckInResult> {
  switch (input.ticketKind) {
    case "TICKET":
      return checkInTicketRecord(input.sourceRecordId, input.scope);
    case "PARTICIPANT":
      return checkInApplicationRecord(input.sourceRecordId);
    case "JURY":
      return checkInJuryRecord(input.sourceRecordId);
  }
}

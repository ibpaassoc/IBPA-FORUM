import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { Prisma, type JuryApplication, type Ticket } from "@prisma/client";
import { syncCheckInOnChange } from "@/features/google-sheets";
import { adminT } from "@/lib/i18n/admin";
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
  | { ok: false; code: "QR_REPLACED"; status: 410; message: string }
  | { ok: false; code: "NOT_PAID"; status: 422; message: string }
  | { ok: false; code: "ALREADY_CHECKED_IN"; status: 409; message: string; checkedInAt: string }
  | { ok: false; code: "BAD_SCOPE"; status: 400; message: string };

export type ResolveResult =
  | { ok: true; ticket: NormalizedTicket }
  | Extract<CheckInError, { code: "INVALID_CODE" | "NOT_FOUND" | "QR_REPLACED" }>;

export type CheckInResult =
  | { ok: true; ticket: NormalizedTicket }
  | CheckInError;

// ─── Normalizers ─────────────────────────────────────────────────────────────

function ticketEligible(status: string) {
  return status !== "PENDING" && status !== "CANCELED";
}

function normalizeTicket(ticket: Ticket): NormalizedTicket {
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
    galaDinnerIncluded: ticket.galaDinner,
    eligibleForCheckIn: ticketEligible(ticket.status),
    sourceRecordId: ticket.id,
    code: buildScanPayload("TICKET", ticket.secureToken),
  };
}

const applicantCheckInSelect = {
  id: true,
  fullName: true,
  phone: true,
  checkedInAt: true,
  account: { select: { email: true } },
  nominations: {
    where: { deletedAt: null },
    select: { status: true, paymentStatus: true },
  },
} satisfies Prisma.ApplicantProfileSelect;

type ApplicantCheckInRecord = Prisma.ApplicantProfileGetPayload<{
  select: typeof applicantCheckInSelect;
}>;

function normalizeApplication(app: ApplicantCheckInRecord, token: string): NormalizedTicket {
  const paid = app.nominations.some((nomination) => nomination.paymentStatus === "PAID");
  const status = app.nominations.find((nomination) => nomination.paymentStatus === "PAID")?.status
    ?? app.nominations[0]?.status
    ?? "PAYMENT_PENDING";
  return {
    ticketKind: "PARTICIPANT",
    ticketType: "Участник премии",
    ownerName: app.fullName,
    email: app.account.email,
    phone: app.phone ?? "",
    status,
    paymentStatus: paid ? "PAID" : "PENDING",
    checkInStatus: app.checkedInAt ? "CHECKED_IN" : "NOT_CHECKED_IN",
    scopes: [
      {
        scope: "ATTENDANCE",
        label: "Посещение мероприятия",
        checkedInAt: app.checkedInAt?.toISOString() ?? null,
        available: true,
        unavailableReason: null,
      },
    ],
    galaDinnerIncluded: null,
    eligibleForCheckIn: paid,
    sourceRecordId: app.id,
    code: buildScanPayload("PARTICIPANT", token),
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
        available: true,
        unavailableReason: null,
      },
    ],
    galaDinnerIncluded: null,
    eligibleForCheckIn: paid,
    sourceRecordId: jury.id,
    code: buildScanPayload("JURY", jury.id),
  };
}

// ─── Lookup ──────────────────────────────────────────────────────────────────

type LookupResult =
  | { kind: "found"; ticket: NormalizedTicket }
  | { kind: "replaced" }
  | { kind: "missing" };

async function findByKind(
  kind: TicketKind,
  token: string,
): Promise<LookupResult> {
  switch (kind) {
    case "TICKET": {
      const credential = await prisma.ticketQrCredential.findUnique({
        where: { token },
        include: { ticket: true },
      });

      if (credential) {
        if (credential.status !== "ACTIVE") return { kind: "replaced" };
        return { kind: "found", ticket: normalizeTicket(credential.ticket) };
      }

      const ticket = await prisma.ticket.findUnique({ where: { secureToken: token } });
      return ticket ? { kind: "found", ticket: normalizeTicket(ticket) } : { kind: "missing" };
    }
    case "PARTICIPANT": {
      const credential = await prisma.applicantCheckInCredential.findUnique({
        where: { token },
        include: { applicantProfile: { select: applicantCheckInSelect } },
      });
      return credential
        ? { kind: "found", ticket: normalizeApplication(credential.applicantProfile, token) }
        : { kind: "missing" };
    }
    case "JURY": {
      const jury = await prisma.juryApplication.findUnique({ where: { id: token } });
      return jury ? { kind: "found", ticket: normalizeJury(jury) } : { kind: "missing" };
    }
  }
}

/**
 * Resolve a scanned QR string to a normalized ticket, searching across every
 * ticket-like source. When the kind is unknown (bare token) each source is
 * tried in turn.
 *
 * Verification is deliberately independent of an entrance or event mode. The
 * normalized result contains every available check-in action so the operator
 * can choose Day 1, Day 2, or Gala Dinner after scanning.
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

  let resolved: NormalizedTicket | null = null;
  let replaced = false;
  if (parsed.kind) {
    const result = await findByKind(parsed.kind, parsed.token);
    if (result.kind === "found") resolved = result.ticket;
    if (result.kind === "replaced") replaced = true;
  } else {
    for (const kind of ["TICKET", "PARTICIPANT", "JURY"] as const) {
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
  }

  if (replaced) {
    return {
      ok: false,
      code: "QR_REPLACED",
      status: 410,
      message: "Этот QR-код был заменён. Используйте новый QR-код клиента.",
    };
  }

  if (!resolved) {
    return {
      ok: false,
      code: "NOT_FOUND",
      status: 404,
      message: "Билет с таким кодом не найден.",
    };
  }

  return { ok: true, ticket: resolved };
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
  if (scope !== "DAY_ONE" && scope !== "DAY_TWO" && scope !== "GALA") {
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

  const existing =
    scope === "GALA"
      ? ticket.galaCheckInAt
      : scope === "DAY_TWO"
        ? ticket.dayTwoCheckInAt
        : ticket.dayOneCheckInAt ?? ticket.forumCheckInAt;
  if (existing) {
    return {
      ok: false,
      code: "ALREADY_CHECKED_IN",
      status: 409,
      message: `Гость уже отмечен ${
        scope === "GALA" ? "на гала-ужине" : scope === "DAY_TWO" ? "во второй день" : "в первый день"
      }.`,
      checkedInAt: existing.toISOString(),
    };
  }

  const oppositeDayCheckIn =
    scope === "DAY_ONE" ? ticket.dayTwoCheckInAt : scope === "DAY_TWO" ? ticket.dayOneCheckInAt ?? ticket.forumCheckInAt : null;
  if (ticket.type === "ONE_DAY" && oppositeDayCheckIn) {
    return {
      ok: false,
      code: "BAD_SCOPE",
      status: 400,
      message: adminT.scanner.oneDayPassUsed,
    };
  }

  const now = new Date();
  // Keep the legacy single-status field in sync for the existing tickets table.
  const legacyStatus =
    scope === "GALA"
      ? "CHECKED_GALA_DINNER"
      : scope === "DAY_TWO"
        ? "CHECKED_TWO_DAY"
        : "CHECKED_ONE_DAY";

  const where: Prisma.TicketWhereInput = {
    id: ticket.id,
    ...(scope === "GALA"
      ? { galaCheckInAt: null }
      : scope === "DAY_TWO"
        ? {
            dayTwoCheckInAt: null,
            ...(ticket.type === "ONE_DAY"
              ? { dayOneCheckInAt: null, forumCheckInAt: null }
              : {}),
          }
        : {
            dayOneCheckInAt: null,
            forumCheckInAt: null,
            ...(ticket.type === "ONE_DAY" ? { dayTwoCheckInAt: null } : {}),
          }),
  };
  const data: Prisma.TicketUpdateManyMutationInput = {
    ...(scope === "GALA"
      ? { galaCheckInAt: now }
      : scope === "DAY_TWO"
        ? { dayTwoCheckInAt: now }
        : { dayOneCheckInAt: now, forumCheckInAt: now }),
    status: legacyStatus,
    lastCheckIn: now,
  };
  const claimed = await prisma.ticket.updateMany({
    where,
    data,
  });

  const updated = await prisma.ticket.findUnique({ where: { id: ticket.id } });
  if (!updated) {
    return { ok: false, code: "NOT_FOUND", status: 404, message: "Билет не найден." };
  }
  if (claimed.count === 0) {
    const checkedInAt =
      scope === "GALA"
        ? updated.galaCheckInAt
        : scope === "DAY_TWO"
          ? updated.dayTwoCheckInAt
          : updated.dayOneCheckInAt ?? updated.forumCheckInAt;
    if (checkedInAt) {
      return {
        ok: false,
        code: "ALREADY_CHECKED_IN",
        status: 409,
        message: adminT.scanner.alreadyCheckedIn,
        checkedInAt: checkedInAt.toISOString(),
      };
    }
    return { ok: false, code: "BAD_SCOPE", status: 400, message: adminT.scanner.oneDayPassUsed };
  }

  return { ok: true, ticket: normalizeTicket(updated) };
}

async function checkInApplicationRecord(recordId: string): Promise<CheckInResult> {
  const app = await prisma.applicantProfile.findUnique({
    where: { id: recordId },
    select: applicantCheckInSelect,
  });
  if (!app) {
    return { ok: false, code: "NOT_FOUND", status: 404, message: "Заявка не найдена." };
  }
  if (!app.nominations.some((nomination) => nomination.paymentStatus === "PAID")) {
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
  const checkedInAt = new Date();
  await prisma.applicantProfile.update({
    where: { id: app.id },
    data: { checkedInAt },
  });
  return { ok: true, ticket: normalizeApplication({ ...app, checkedInAt }, app.id) };
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

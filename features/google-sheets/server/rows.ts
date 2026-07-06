import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { CATEGORY_SEPARATOR, orderCategories } from "./categories";
import type { SheetValues } from "./client";
import { formatDateTime, formatUsd, joinList, yesNo } from "./format";
import {
  scoreStatusLabel,
  ticketPaymentLabel,
  ticketTypeLabelRu,
} from "./labels";

/**
 * Database → spreadsheet row mappers. Each builder fetches exactly the columns
 * it needs and returns a row array aligned with the matching sheet definition.
 * Reviewer / internal admin identities are intentionally never included.
 *
 * The Applications and Jury tabs only ever expose *paid* records: the single-row
 * fetchers return `null` for anything unpaid (so the per-record hooks never add
 * it) and the bulk fetchers filter the same way (so backfills mirror only paid
 * rows). Their category cell is multi-value and colour-coded.
 *
 * The `*WithCategories` variants also return each row's category set so the sync
 * layer can copy the row into the matching per-category tabs (a multi-category
 * record lands in each of its categories' tabs).
 */

/** A spreadsheet row paired with the categories the record belongs to. */
export type CategorizedRow = {
  values: SheetValues[number];
  categories: string[];
};

const NUMBER_OF_SCORE_CRITERIA = 5;

// ── Applications ─────────────────────────────────────────────────────────────

const applicationSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  websiteUrl: true,
  socialUrl: true,
  membershipLevel: true,
  membershipNumber: true,
  amount: true,
  paymentStatus: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
  category: { select: { name: true } },
  award: { select: { name: true } },
  nominationApplications: {
    select: {
      award: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  payments: { select: { amount: true, status: true } },
  judgeScores: {
    where: { status: "SUBMITTED" as const },
    select: { totalScore: true },
  },
} satisfies Prisma.ApplicationSelect;

type ApplicationRecord = Prisma.ApplicationGetPayload<{ select: typeof applicationSelect }>;

/** Only paid applications ever reach the sheet — no drafts, pending, failed… */
function isApplicationPaid(app: Pick<ApplicationRecord, "paymentStatus">): boolean {
  return app.paymentStatus === "PAID";
}

function isApplicationMember(app: ApplicationRecord): boolean {
  return Boolean(app.membershipLevel) || Boolean(app.membershipNumber);
}

/** Every category an application belongs to: its primary plus each nomination's. */
function applicationCategories(app: ApplicationRecord): string[] {
  return orderCategories([
    app.category.name,
    ...app.nominationApplications.map((nom) => nom.category.name),
  ]);
}

function applicationScoreSummary(app: ApplicationRecord): string {
  const totals = app.judgeScores
    .map((score) => score.totalScore)
    .filter((value): value is number => value != null);
  if (totals.length === 0) return "";
  const average = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  return `оценок: ${totals.length} · средн. ${average.toFixed(1)}`;
}

function applicationAmountPaidCents(app: ApplicationRecord): number {
  const paid = app.payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amount, 0);
  if (paid > 0) return paid;
  return app.paymentStatus === "PAID" ? app.amount : 0;
}

function mapApplicationCategorized(app: ApplicationRecord): CategorizedRow {
  const nominations = app.nominationApplications.map((nom) => nom.award.name);
  const nominationLabel =
    nominations.length > 0 ? joinList(nominations) : app.award.name;
  const member = isApplicationMember(app);

  return [
    app.id,
    app.fullName,
    app.email,
    app.phone,
    app.websiteUrl ?? "",
    app.category.name,
    nominationLabel,
    yesNo(member),
    app.membershipNumber ?? "",
    formatUsd(applicationAmountPaidCents(app)),
    humanizeEnum(app.status),
    formatDateTime(app.submittedAt),
    formatDateTime(app.updatedAt),
    // Application has no dedicated reviewed-at timestamp.
    "",
    applicationScoreSummary(app),
  ];
}

export async function fetchApplicationRow(id: string): Promise<CategorizedRow | null> {
  const app = await prisma.application.findUnique({ where: { id }, select: applicationSelect });
  if (!app || !isApplicationPaid(app)) return null;
  return mapApplicationCategorized(app);
}

export async function fetchAllApplicationRows(): Promise<CategorizedRow[]> {
  const apps = await prisma.application.findMany({
    where: { paymentStatus: "PAID" },
    select: applicationSelect,
    orderBy: { createdAt: "asc" },
  });
  return apps.map(mapApplicationCategorized);
}

// ── Jury ─────────────────────────────────────────────────────────────────────

const jurySelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  country: true,
  city: true,
  professionalTitle: true,
  yearsExperience: true,
  expertiseAreas: true,
  ibpaAssociationMember: true,
  ibpaNumber: true,
  professionalWebsite: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
  approvedAt: true,
  rejectedAt: true,
  adminNotes: true,
  payments: {
    where: { source: "JURY" as const },
    select: { amount: true, status: true },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.JuryApplicationSelect;

type JuryRecord = Prisma.JuryApplicationGetPayload<{ select: typeof jurySelect }>;

/** Only paid jury applications ever reach the sheet. */
function isJuryPaid(jury: Pick<JuryRecord, "status">): boolean {
  return jury.status === "PAID";
}

function juryPriceCents(jury: JuryRecord): number {
  const paid = jury.payments.find((payment) => payment.status === "PAID");
  if (paid) return paid.amount;
  const latest = jury.payments[0];
  if (latest) return latest.amount;
  // Fall back to the standard jury pricing when no payment row exists yet.
  return jury.ibpaAssociationMember ? 10000 : 25000;
}

export function mapJuryRow(jury: JuryRecord): SheetValues[number] {
  return [
    jury.id,
    jury.fullName,
    jury.email,
    jury.phone,
    jury.professionalWebsite ?? "",
    jury.country,
    jury.city,
    jury.professionalTitle,
    jury.yearsExperience,
    joinList(jury.expertiseAreas),
    yesNo(jury.ibpaAssociationMember),
    jury.ibpaNumber ?? "",
    formatUsd(juryPriceCents(jury)),
    humanizeEnum(jury.status),
    formatDateTime(jury.submittedAt),
    formatDateTime(jury.updatedAt),
    formatDateTime(jury.approvedAt ?? jury.rejectedAt),
    jury.adminNotes ?? "",
  ];
}

export async function fetchJuryRow(id: string): Promise<CategorizedRow | null> {
  const jury = await prisma.juryApplication.findUnique({ where: { id }, select: jurySelect });
  if (!jury || !isJuryPaid(jury)) return null;
  return mapJuryCategorized(jury);
}

export async function fetchAllJuryRows(): Promise<CategorizedRow[]> {
  const records = await prisma.juryApplication.findMany({
    where: { status: "PAID" },
    select: jurySelect,
    orderBy: { createdAt: "asc" },
  });
  return records.map(mapJuryCategorized);
}

// ── Scores ───────────────────────────────────────────────────────────────────

const scoreSelect = {
  id: true,
  applicationId: true,
  nominationApplicationId: true,
  judgeId: true,
  technical: true,
  aesthetic: true,
  creativity: true,
  impact: true,
  presentation: true,
  totalScore: true,
  comment: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
  judge: { select: { fullName: true } },
  application: { select: { fullName: true } },
  nominationApplication: { select: { category: { select: { name: true } } } },
} satisfies Prisma.JudgeScoreSelect;

type ScoreRecord = Prisma.JudgeScoreGetPayload<{ select: typeof scoreSelect }>;

function criteria(value: number | null): number | string {
  return value == null ? "" : value;
}

function averageScore(total: number | null): number | string {
  if (total == null) return "";
  return Math.round((total / NUMBER_OF_SCORE_CRITERIA) * 10) / 10;
}

export function mapScoreRow(score: ScoreRecord): SheetValues[number] {
  return [
    score.id,
    score.applicationId,
    score.nominationApplicationId ?? "",
    score.judgeId,
    score.judge.fullName,
    score.application.fullName,
    score.nominationApplication?.category.name ?? "",
    criteria(score.technical),
    criteria(score.aesthetic),
    criteria(score.creativity),
    criteria(score.impact),
    criteria(score.presentation),
    score.totalScore ?? "",
    averageScore(score.totalScore),
    scoreStatusLabel(score.status),
    score.comment ?? "",
    formatDateTime(score.submittedAt),
    formatDateTime(score.updatedAt),
  ];
}

export async function fetchScoreRow(id: string): Promise<SheetValues[number] | null> {
  const score = await prisma.judgeScore.findUnique({ where: { id }, select: scoreSelect });
  return score ? mapScoreRow(score) : null;
}

export async function fetchAllScoreRows(): Promise<SheetValues> {
  const scores = await prisma.judgeScore.findMany({
    select: scoreSelect,
    orderBy: { createdAt: "asc" },
  });
  return scores.map(mapScoreRow);
}

// ── Tickets ──────────────────────────────────────────────────────────────────

const ticketSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  instagram: true,
  type: true,
  secureToken: true,
  status: true,
  forumCheckInAt: true,
  galaCheckInAt: true,
  createdAt: true,
  updatedAt: true,
  payments: {
    where: { source: "TICKET" as const },
    select: { amount: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} satisfies Prisma.TicketSelect;

type TicketRecord = Prisma.TicketGetPayload<{ select: typeof ticketSelect }>;

export function mapTicketRow(ticket: TicketRecord): SheetValues[number] {
  const payment = ticket.payments[0] ?? null;
  const totalPaidCents = payment?.amount ?? 0;
  const checkInAt = ticket.forumCheckInAt ?? ticket.galaCheckInAt;

  return [
    ticket.id,
    ticket.fullName,
    ticket.email,
    ticket.phone,
    ticket.instagram ?? "",
    ticketTypeLabelRu(ticket.type),
    // Single price column: the full amount actually paid (Стоимость). The former
    // Quantity, per-ticket portion and Discount columns were removed.
    formatUsd(totalPaidCents),
    ticketPaymentLabel(ticket.status),
    ticket.secureToken,
    yesNo(Boolean(checkInAt)),
    formatDateTime(checkInAt),
    formatDateTime(ticket.createdAt),
    formatDateTime(ticket.updatedAt),
  ];
}

export async function fetchTicketRow(id: string): Promise<SheetValues[number] | null> {
  const ticket = await prisma.ticket.findUnique({ where: { id }, select: ticketSelect });
  return ticket ? mapTicketRow(ticket) : null;
}

export async function fetchAllTicketRows(): Promise<SheetValues> {
  const tickets = await prisma.ticket.findMany({
    select: ticketSelect,
    orderBy: { createdAt: "asc" },
  });
  return tickets.map(mapTicketRow);
}

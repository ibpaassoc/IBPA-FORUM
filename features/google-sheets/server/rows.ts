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
import {
  readReviewScores,
  resolveNominationScoringDefinition,
} from "@/features/jury/scoring/category-scoring";

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

// ── Applications ─────────────────────────────────────────────────────────────

const applicantSelect = {
  id: true,
  fullName: true,
  phone: true,
  socialUrl: true,
  membershipLevel: true,
  membershipNumber: true,
  updatedAt: true,
  account: {
    select: {
      email: true,
      payments: {
        where: { status: "PAID" as const, purchaseType: "NOMINATION" as const },
        select: { amount: true },
      },
    },
  },
  nominations: {
    where: { payment: { status: "PAID" as const }, status: { not: "ARCHIVED" as const } },
    select: {
      submittedAt: true,
      updatedAt: true,
      award: { select: { name: true } },
      category: { select: { name: true } },
      reviews: {
        where: { status: "COMPLETED" as const },
        select: { totalScore: true },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ApplicantProfileSelect;

type ApplicationRecord = Prisma.ApplicantProfileGetPayload<{ select: typeof applicantSelect }>;

function isApplicationMember(app: ApplicationRecord): boolean {
  return Boolean(app.membershipLevel) || Boolean(app.membershipNumber);
}

function applicationCategories(app: ApplicationRecord): string[] {
  return orderCategories(app.nominations.map((nomination) => nomination.category.name));
}

function applicationScoreSummary(app: ApplicationRecord): string {
  const totals = app.nominations
    .flatMap((nomination) => nomination.reviews)
    .map((score) => score.totalScore)
    .filter((value) => value != null)
    .map(Number);
  if (totals.length === 0) return "";
  const average = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  return `оценок: ${totals.length} · средн. ${average.toFixed(1)}`;
}

function applicationAmountPaidCents(app: ApplicationRecord): number {
  return app.account.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

function mapApplicationCategorized(app: ApplicationRecord): CategorizedRow {
  const nominationLabel = joinList(app.nominations.map((nomination) => nomination.award.name));
  const member = isApplicationMember(app);
  const categories = applicationCategories(app);
  const submittedAt = app.nominations
    .map((nomination) => nomination.submittedAt)
    .filter((value): value is Date => value !== null)
    .sort((left, right) => left.getTime() - right.getTime())[0] ?? null;
  const updatedAt = app.nominations.reduce(
    (latest, nomination) => nomination.updatedAt > latest ? nomination.updatedAt : latest,
    app.updatedAt
  );

  return {
    categories,
    values: [
      app.id,
      app.fullName,
      app.account.email,
      app.phone ?? "",
      app.socialUrl ?? "",
      categories.join(CATEGORY_SEPARATOR),
      nominationLabel,
      yesNo(member),
      app.membershipNumber ?? "",
      formatUsd(applicationAmountPaidCents(app)),
      formatDateTime(submittedAt),
      formatDateTime(updatedAt),
      applicationScoreSummary(app),
    ],
  };
}

export async function fetchApplicationRow(id: string): Promise<CategorizedRow | null> {
  const app = await prisma.applicantProfile.findUnique({ where: { id }, select: applicantSelect });
  if (!app || app.nominations.length === 0) return null;
  return mapApplicationCategorized(app);
}

export async function fetchAllApplicationRows(): Promise<CategorizedRow[]> {
  const apps = await prisma.applicantProfile.findMany({
    where: { nominations: { some: { payment: { status: "PAID" }, status: { not: "ARCHIVED" } } } },
    select: applicantSelect,
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
  profile: { select: { approvedCategories: true } },
  ibpaAssociationMember: true,
  ibpaNumber: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
  approvedAt: true,
  rejectedAt: true,
  adminNotes: true,
  payments: {
    where: { purchaseType: "JURY" as const },
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

function mapJuryCategorized(jury: JuryRecord): CategorizedRow {
  // Areas of expertise are the jury member's categories (shared vocabulary with
  // the Applications tab), so they colour-code and route into tabs identically.
  const categories = orderCategories(jury.profile?.approvedCategories ?? []);

  return {
    categories,
    values: [
      jury.id,
      jury.fullName,
      jury.email,
      jury.phone,
      jury.country,
      jury.city,
      jury.professionalTitle,
      jury.yearsExperience,
      categories.join(CATEGORY_SEPARATOR),
      yesNo(jury.ibpaAssociationMember),
      jury.ibpaNumber ?? "",
      formatUsd(juryPriceCents(jury)),
      formatDateTime(jury.submittedAt),
      formatDateTime(jury.updatedAt),
      formatDateTime(jury.approvedAt ?? jury.rejectedAt),
      jury.adminNotes ?? "",
      // The trailing checkbox columns (Приглашение / Благодарственное письмо /
      // Сертификат судьи) are admin-editable and preserved by the sheet layer,
      // so they are intentionally not produced here.
    ],
  };
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
  nominationId: true,
  juryProfileId: true,
  scoreData: true,
  totalScore: true,
  comments: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
  juryProfile: { select: { fullName: true } },
  nomination: {
    select: {
      scoringSchema: true,
      applicantProfile: { select: { fullName: true } },
      category: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.JuryNominationReviewSelect;

type ScoreRecord = Prisma.JuryNominationReviewGetPayload<{ select: typeof scoreSelect }>;

function criteria(value: number | null): number | string {
  return value == null ? "" : value;
}

function averageScore(total: Prisma.Decimal | null, maximumTotal: number): number | string {
  if (total == null) return "";
  return Math.round((Number(total) / maximumTotal) * 100) / 10;
}

export function mapScoreRow(score: ScoreRecord): SheetValues[number] {
  const scoringDefinition = resolveNominationScoringDefinition(
    score.nomination.scoringSchema,
    score.nomination.category.slug
  );
  const scores = readReviewScores(score.scoreData, scoringDefinition);

  return [
    score.id,
    score.nominationId,
    score.juryProfileId,
    score.juryProfile.fullName,
    score.nomination.applicantProfile?.fullName ?? "",
    score.nomination.category.name,
    ...scoringDefinition.criteria.map((criterion) => criteria(scores[criterion.key])),
    score.totalScore === null ? "" : Number(score.totalScore),
    averageScore(score.totalScore, scoringDefinition.maximumTotal),
    scoreStatusLabel(score.status),
    score.comments ?? "",
    formatDateTime(score.submittedAt),
    formatDateTime(score.updatedAt),
  ];
}

export async function fetchScoreRow(id: string): Promise<SheetValues[number] | null> {
  const score = await prisma.juryNominationReview.findUnique({ where: { id }, select: scoreSelect });
  return score ? mapScoreRow(score) : null;
}

export async function fetchAllScoreRows(): Promise<SheetValues> {
  const scores = await prisma.juryNominationReview.findMany({
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
  dayOneCheckInAt: true,
  dayTwoCheckInAt: true,
  galaCheckInAt: true,
  createdAt: true,
  updatedAt: true,
  payment: {
    select: { amount: true, status: true },
  },
} satisfies Prisma.TicketSelect;

type TicketRecord = Prisma.TicketGetPayload<{ select: typeof ticketSelect }>;

export function mapTicketRow(ticket: TicketRecord): SheetValues[number] {
  const payment = ticket.payment ?? null;
  const totalPaidCents = payment?.amount ?? 0;
  const checkInAt =
    ticket.dayOneCheckInAt ??
    ticket.dayTwoCheckInAt ??
    ticket.forumCheckInAt ??
    ticket.galaCheckInAt;

  return [
    ticket.id,
    ticket.fullName,
    ticket.email,
    ticket.phone,
    ticket.instagram ?? "",
    ticketTypeLabelRu(ticket.type ?? "TWO_DAYS"),
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
  const ticket = await prisma.ticket.findFirst({ where: { id, kind: "FORUM" }, select: ticketSelect });
  return ticket ? mapTicketRow(ticket) : null;
}

export async function fetchAllTicketRows(): Promise<SheetValues> {
  const tickets = await prisma.ticket.findMany({
    where: { kind: "FORUM" },
    select: ticketSelect,
    orderBy: { createdAt: "asc" },
  });
  return tickets.map(mapTicketRow);
}

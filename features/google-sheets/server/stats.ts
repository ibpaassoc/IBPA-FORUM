import "server-only";
import type { ApplicationStatus, TicketType } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { SheetValues } from "./client";
import { formatDateTime, formatUsd } from "./format";
import { applicationStatusLabel, ticketTypeLabelRu } from "./labels";

/**
 * Compute platform statistics directly from the database (rather than relying on
 * fragile in-sheet formulas) and render them as a grouped Metric/Value dashboard
 * for the stats tab. Currency is always USD; counts are plain numbers.
 *
 * Returns the rows together with the indexes of the title and section-header
 * rows so the sync layer can style them into a readable dashboard.
 */

export type StatsLayout = {
  rows: SheetValues;
  titleRowIndex: number;
  sectionRowIndexes: number[];
};

class StatsBuilder {
  readonly rows: SheetValues = [];
  readonly sectionRowIndexes: number[] = [];
  titleRowIndex = 0;

  title(text: string): void {
    this.titleRowIndex = this.rows.length;
    this.rows.push([text, ""]);
  }

  section(text: string): void {
    this.sectionRowIndexes.push(this.rows.length);
    this.rows.push([text, ""]);
  }

  metric(label: string, value: string | number): void {
    this.rows.push([label, value]);
  }
}

function countBy<T>(items: T[], key: (item: T) => string): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export async function computeStatsLayout(): Promise<StatsLayout> {
  const [applications, juryApplications, submittedScores, tickets, paidRevenue] =
    await Promise.all([
      prisma.application.findMany({
        select: {
          status: true,
          paymentStatus: true,
          amount: true,
          membershipLevel: true,
          membershipNumber: true,
          category: { select: { name: true } },
        },
      }),
      prisma.juryApplication.findMany({
        select: { status: true, ibpaAssociationMember: true },
      }),
      prisma.judgeScore.findMany({
        where: { status: "SUBMITTED" },
        select: {
          totalScore: true,
          nominationApplication: { select: { category: { select: { name: true } } } },
        },
      }),
      prisma.ticket.findMany({
        select: {
          type: true,
          status: true,
          forumCheckInAt: true,
          galaCheckInAt: true,
        },
      }),
      prisma.payment.groupBy({
        by: ["source"],
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

  const revenueBySource = (source: "COMPETITOR" | "JURY" | "TICKET"): number =>
    paidRevenue.find((row) => row.source === source)?._sum.amount ?? 0;

  const now = formatDateTime(new Date());
  const builder = new StatsBuilder();

  builder.title("Статистика платформы IBPA");

  // ── Sync info ────────────────────────────────────────────────────────────
  builder.section("СИНХРОНИЗАЦИЯ");
  builder.metric("Время последней синхронизации", now);
  builder.metric("Последняя успешная синхронизация", now);

  // ── Applications ─────────────────────────────────────────────────────────
  const appMember = (app: (typeof applications)[number]) =>
    Boolean(app.membershipLevel) || Boolean(app.membershipNumber);
  const appPaidCount = applications.filter((a) => a.paymentStatus === "PAID").length;
  const appRevenue = revenueBySource("COMPETITOR");
  const appPriceTotal = applications.reduce((sum, a) => sum + a.amount, 0);

  builder.section("ЗАЯВКИ");
  builder.metric("Всего заявок", applications.length);
  for (const [status, count] of countBy(applications, (a) => a.status)) {
    builder.metric(`По статусу — ${applicationStatusLabel(status as ApplicationStatus)}`, count);
  }
  for (const [category, count] of countBy(applications, (a) => a.category.name)) {
    builder.metric(`По категории — ${category}`, count);
  }
  builder.metric("Участники IBPA", applications.filter(appMember).length);
  builder.metric("Не участники", applications.filter((a) => !appMember(a)).length);
  builder.metric("Оплачено", appPaidCount);
  builder.metric("Не оплачено", applications.length - appPaidCount);
  builder.metric("Доход от заявок", formatUsd(appRevenue));
  builder.metric(
    "Средняя стоимость заявки",
    formatUsd(applications.length ? Math.round(appPriceTotal / applications.length) : 0)
  );

  // ── Jury ─────────────────────────────────────────────────────────────────
  const juryPending = juryApplications.filter(
    (j) => j.status === "SUBMITTED" || j.status === "ADDITIONAL_INFO_REQUIRED"
  ).length;

  builder.section("ЖЮРИ");
  builder.metric("Всего заявок в жюри", juryApplications.length);
  builder.metric("Одобрено", juryApplications.filter((j) => j.status === "APPROVED").length);
  builder.metric("Оплачено", juryApplications.filter((j) => j.status === "PAID").length);
  builder.metric("В ожидании", juryPending);
  builder.metric("Отклонено", juryApplications.filter((j) => j.status === "REJECTED").length);
  builder.metric("Участники IBPA", juryApplications.filter((j) => j.ibpaAssociationMember).length);
  builder.metric("Не участники", juryApplications.filter((j) => !j.ibpaAssociationMember).length);

  // ── Scores ───────────────────────────────────────────────────────────────
  const scoreTotals = submittedScores
    .map((s) => s.totalScore)
    .filter((value): value is number => value != null);
  const averageOverall =
    scoreTotals.length > 0
      ? scoreTotals.reduce((sum, v) => sum + v, 0) / scoreTotals.length
      : null;

  builder.section("ОЦЕНКИ");
  builder.metric("Всего оценок отправлено", submittedScores.length);
  builder.metric(
    "Средний общий балл",
    averageOverall == null ? "—" : Math.round(averageOverall * 10) / 10
  );
  builder.metric("Максимальный балл", scoreTotals.length ? Math.max(...scoreTotals) : "—");
  builder.metric("Минимальный балл", scoreTotals.length ? Math.min(...scoreTotals) : "—");

  const scoresByCategory = new Map<string, number[]>();
  for (const score of submittedScores) {
    if (score.totalScore == null) continue;
    const category = score.nominationApplication?.category.name ?? "Без категории";
    const list = scoresByCategory.get(category) ?? [];
    list.push(score.totalScore);
    scoresByCategory.set(category, list);
  }
  for (const [category, totals] of scoresByCategory) {
    const avg = totals.reduce((sum, v) => sum + v, 0) / totals.length;
    builder.metric(`Средний балл — ${category}`, Math.round(avg * 10) / 10);
  }

  // ── Tickets ──────────────────────────────────────────────────────────────
  const soldTickets = tickets.filter(
    (t) => t.status !== "PENDING" && t.status !== "CANCELED"
  );
  const checkedInCount = soldTickets.filter(
    (t) => t.forumCheckInAt != null || t.galaCheckInAt != null
  ).length;
  const ticketRevenue = revenueBySource("TICKET");

  builder.section("БИЛЕТЫ");
  builder.metric("Всего продано билетов", soldTickets.length);
  for (const [type, count] of countBy(soldTickets, (t) => t.type)) {
    builder.metric(`По типу — ${ticketTypeLabelRu(type as TicketType)}`, count);
  }
  builder.metric("Средняя стоимость билета", formatUsd(
    soldTickets.length ? Math.round(ticketRevenue / soldTickets.length) : 0
  ));
  builder.metric("Отмечено", checkedInCount);
  builder.metric("Не отмечено", soldTickets.length - checkedInCount);

  // ── Revenue ──────────────────────────────────────────────────────────────
  const juryRevenue = revenueBySource("JURY");
  const totalRevenue = appRevenue + juryRevenue + ticketRevenue;

  builder.section("ДОХОД");
  builder.metric("Доход от заявок", formatUsd(appRevenue));
  builder.metric("Доход от жюри", formatUsd(juryRevenue));
  builder.metric("Доход от билетов", formatUsd(ticketRevenue));
  builder.metric("Общий доход", formatUsd(totalRevenue));

  return {
    rows: builder.rows,
    titleRowIndex: builder.titleRowIndex,
    sectionRowIndexes: builder.sectionRowIndexes,
  };
}

import "server-only";
import { prisma } from "@/shared/lib/prisma";
import type { SheetValues } from "./client";
import { formatDateTime, formatUsd, humanizeEnum } from "./format";

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

  builder.title("IBPA Platform Statistics");

  // ── Sync info ────────────────────────────────────────────────────────────
  builder.section("SYNC INFO");
  builder.metric("Last Sync Time", now);
  builder.metric("Last Successful Sync", now);

  // ── Applications ─────────────────────────────────────────────────────────
  const appMember = (app: (typeof applications)[number]) =>
    Boolean(app.membershipLevel) || Boolean(app.membershipNumber);
  const appPaidCount = applications.filter((a) => a.paymentStatus === "PAID").length;
  const appRevenue = revenueBySource("COMPETITOR");
  const appPriceTotal = applications.reduce((sum, a) => sum + a.amount, 0);

  builder.section("APPLICATIONS");
  builder.metric("Total Applications", applications.length);
  for (const [status, count] of countBy(applications, (a) => a.status)) {
    builder.metric(`By Status — ${humanizeEnum(status)}`, count);
  }
  for (const [category, count] of countBy(applications, (a) => a.category.name)) {
    builder.metric(`By Category — ${category}`, count);
  }
  builder.metric("IBPA Members", applications.filter(appMember).length);
  builder.metric("Non-members", applications.filter((a) => !appMember(a)).length);
  builder.metric("Paid", appPaidCount);
  builder.metric("Unpaid", applications.length - appPaidCount);
  builder.metric("Total Application Revenue", formatUsd(appRevenue));
  builder.metric(
    "Average Application Price",
    formatUsd(applications.length ? Math.round(appPriceTotal / applications.length) : 0)
  );

  // ── Jury ─────────────────────────────────────────────────────────────────
  const juryPending = juryApplications.filter(
    (j) => j.status === "SUBMITTED" || j.status === "ADDITIONAL_INFO_REQUIRED"
  ).length;

  builder.section("JURY");
  builder.metric("Total Jury Applications", juryApplications.length);
  builder.metric("Approved", juryApplications.filter((j) => j.status === "APPROVED").length);
  builder.metric("Paid", juryApplications.filter((j) => j.status === "PAID").length);
  builder.metric("Pending", juryPending);
  builder.metric("Rejected", juryApplications.filter((j) => j.status === "REJECTED").length);
  builder.metric("IBPA Members", juryApplications.filter((j) => j.ibpaAssociationMember).length);
  builder.metric("Non-members", juryApplications.filter((j) => !j.ibpaAssociationMember).length);

  // ── Scores ───────────────────────────────────────────────────────────────
  const scoreTotals = submittedScores
    .map((s) => s.totalScore)
    .filter((value): value is number => value != null);
  const averageOverall =
    scoreTotals.length > 0
      ? scoreTotals.reduce((sum, v) => sum + v, 0) / scoreTotals.length
      : null;

  builder.section("SCORES");
  builder.metric("Total Scores Submitted", submittedScores.length);
  builder.metric(
    "Average Overall Score",
    averageOverall == null ? "—" : Math.round(averageOverall * 10) / 10
  );
  builder.metric("Highest Score", scoreTotals.length ? Math.max(...scoreTotals) : "—");
  builder.metric("Lowest Score", scoreTotals.length ? Math.min(...scoreTotals) : "—");

  const scoresByCategory = new Map<string, number[]>();
  for (const score of submittedScores) {
    if (score.totalScore == null) continue;
    const category = score.nominationApplication?.category.name ?? "Uncategorized";
    const list = scoresByCategory.get(category) ?? [];
    list.push(score.totalScore);
    scoresByCategory.set(category, list);
  }
  for (const [category, totals] of scoresByCategory) {
    const avg = totals.reduce((sum, v) => sum + v, 0) / totals.length;
    builder.metric(`Average Score — ${category}`, Math.round(avg * 10) / 10);
  }

  // ── Tickets ──────────────────────────────────────────────────────────────
  const soldTickets = tickets.filter(
    (t) => t.status !== "PENDING" && t.status !== "CANCELED"
  );
  const checkedInCount = soldTickets.filter(
    (t) => t.forumCheckInAt != null || t.galaCheckInAt != null
  ).length;
  const ticketRevenue = revenueBySource("TICKET");

  builder.section("TICKETS");
  builder.metric("Total Tickets Sold", soldTickets.length);
  for (const [type, count] of countBy(soldTickets, (t) => t.type)) {
    builder.metric(`By Type — ${humanizeEnum(type)}`, count);
  }
  builder.metric("Average Ticket Price", formatUsd(
    soldTickets.length ? Math.round(ticketRevenue / soldTickets.length) : 0
  ));
  builder.metric("Checked In", checkedInCount);
  builder.metric("Not Checked In", soldTickets.length - checkedInCount);

  // ── Revenue ──────────────────────────────────────────────────────────────
  const juryRevenue = revenueBySource("JURY");
  const totalRevenue = appRevenue + juryRevenue + ticketRevenue;

  builder.section("REVENUE");
  builder.metric("Application Revenue", formatUsd(appRevenue));
  builder.metric("Jury Revenue", formatUsd(juryRevenue));
  builder.metric("Ticket Revenue", formatUsd(ticketRevenue));
  builder.metric("Total Revenue", formatUsd(totalRevenue));

  return {
    rows: builder.rows,
    titleRowIndex: builder.titleRowIndex,
    sectionRowIndexes: builder.sectionRowIndexes,
  };
}

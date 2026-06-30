import "server-only";
import { prisma } from "@/shared/lib/prisma";
import type { SheetValues } from "./client";
import { formatDateTime, formatUsd, humanizeEnum } from "./format";

/**
 * Compute platform statistics directly from the database (rather than relying on
 * fragile in-sheet formulas) and render them as Metric/Value rows for the stats
 * tab. Currency is always USD; counts are plain numbers.
 */

function sectionRow(title: string): SheetValues[number] {
  return [title, ""];
}

const BLANK_ROW: SheetValues[number] = ["", ""];

function countBy<T>(items: T[], key: (item: T) => string): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export const STATS_TITLE_ROW: SheetValues[number] = ["IBPA Platform Statistics", ""];

export async function computeStatsRows(): Promise<SheetValues> {
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
  const rows: SheetValues = [];

  rows.push(STATS_TITLE_ROW);
  rows.push(["Last Sync Time", now]);
  rows.push(["Last Successful Sync", now]);
  rows.push(BLANK_ROW);

  // ── Applications ───────────────────────────────────────────────────────────
  const appMember = (app: (typeof applications)[number]) =>
    Boolean(app.membershipLevel) || Boolean(app.membershipNumber);
  const appPaidCount = applications.filter((a) => a.paymentStatus === "PAID").length;
  const appRevenue = revenueBySource("COMPETITOR");
  const appPriceTotal = applications.reduce((sum, a) => sum + a.amount, 0);

  rows.push(sectionRow("APPLICATIONS"));
  rows.push(["Total Applications", applications.length]);
  for (const [status, count] of countBy(applications, (a) => a.status)) {
    rows.push([`By Status — ${humanizeEnum(status)}`, count]);
  }
  for (const [category, count] of countBy(applications, (a) => a.category.name)) {
    rows.push([`By Category — ${category}`, count]);
  }
  rows.push([
    "By Applicant Type — IBPA Member",
    applications.filter(appMember).length,
  ]);
  rows.push([
    "By Applicant Type — Non-member",
    applications.filter((a) => !appMember(a)).length,
  ]);
  rows.push(["Paid", appPaidCount]);
  rows.push(["Unpaid", applications.length - appPaidCount]);
  rows.push(["Total Application Revenue", formatUsd(appRevenue)]);
  rows.push([
    "Average Application Price",
    formatUsd(applications.length ? Math.round(appPriceTotal / applications.length) : 0),
  ]);
  rows.push(BLANK_ROW);

  // ── Jury ───────────────────────────────────────────────────────────────────
  const juryPending = juryApplications.filter(
    (j) => j.status === "SUBMITTED" || j.status === "ADDITIONAL_INFO_REQUIRED"
  ).length;

  rows.push(sectionRow("JURY"));
  rows.push(["Total Jury Applications", juryApplications.length]);
  rows.push(["Approved", juryApplications.filter((j) => j.status === "APPROVED").length]);
  rows.push(["Paid", juryApplications.filter((j) => j.status === "PAID").length]);
  rows.push(["Pending", juryPending]);
  rows.push(["Rejected", juryApplications.filter((j) => j.status === "REJECTED").length]);
  rows.push([
    "IBPA Members",
    juryApplications.filter((j) => j.ibpaAssociationMember).length,
  ]);
  rows.push([
    "Non-members",
    juryApplications.filter((j) => !j.ibpaAssociationMember).length,
  ]);
  rows.push(BLANK_ROW);

  // ── Scores ─────────────────────────────────────────────────────────────────
  const scoreTotals = submittedScores
    .map((s) => s.totalScore)
    .filter((value): value is number => value != null);
  const averageOverall =
    scoreTotals.length > 0
      ? scoreTotals.reduce((sum, v) => sum + v, 0) / scoreTotals.length
      : null;

  rows.push(sectionRow("SCORES"));
  rows.push(["Total Scores Submitted", submittedScores.length]);
  rows.push([
    "Average Overall Score",
    averageOverall == null ? "" : Math.round(averageOverall * 10) / 10,
  ]);
  rows.push([
    "Highest Score",
    scoreTotals.length ? Math.max(...scoreTotals) : "",
  ]);
  rows.push([
    "Lowest Score",
    scoreTotals.length ? Math.min(...scoreTotals) : "",
  ]);

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
    rows.push([`Average Score — ${category}`, Math.round(avg * 10) / 10]);
  }
  rows.push(BLANK_ROW);

  // ── Tickets ────────────────────────────────────────────────────────────────
  const soldTickets = tickets.filter(
    (t) => t.status !== "PENDING" && t.status !== "CANCELED"
  );
  const checkedInCount = soldTickets.filter(
    (t) => t.forumCheckInAt != null || t.galaCheckInAt != null
  ).length;
  const ticketRevenue = revenueBySource("TICKET");

  rows.push(sectionRow("TICKETS"));
  rows.push(["Total Tickets Sold", soldTickets.length]);
  for (const [type, count] of countBy(soldTickets, (t) => t.type)) {
    rows.push([`By Type — ${humanizeEnum(type)}`, count]);
  }
  rows.push(["Total Ticket Revenue", formatUsd(ticketRevenue)]);
  rows.push([
    "Average Ticket Price",
    formatUsd(soldTickets.length ? Math.round(ticketRevenue / soldTickets.length) : 0),
  ]);
  rows.push(["Checked In", checkedInCount]);
  rows.push(["Not Checked In", soldTickets.length - checkedInCount]);
  rows.push(BLANK_ROW);

  // ── Global ─────────────────────────────────────────────────────────────────
  const totalRevenue =
    revenueBySource("COMPETITOR") + revenueBySource("JURY") + revenueBySource("TICKET");

  rows.push(sectionRow("GLOBAL"));
  rows.push(["Application Revenue", formatUsd(appRevenue)]);
  rows.push(["Jury Revenue", formatUsd(revenueBySource("JURY"))]);
  rows.push(["Ticket Revenue", formatUsd(ticketRevenue)]);
  rows.push(["Total Revenue", formatUsd(totalRevenue)]);

  return rows;
}

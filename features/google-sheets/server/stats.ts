import "server-only";
import { prisma } from "@/shared/lib/prisma";
import { CATEGORY_ORDER, orderCategories } from "./categories";
import type { SheetValues } from "./client";
import { formatDateTime, formatUsd } from "./format";
import { ticketTypeLabelRu } from "./labels";

/**
 * Compute platform statistics directly from the database (rather than relying on
 * fragile in-sheet formulas) and render them as a grouped Metric/Value dashboard
 * for the stats tab.
 *
 * Only *paid* records are counted: paid applications, paid jury applications and
 * sold tickets. Category breakdowns count a multi-category record in every one of
 * its categories — an application entered in "Hair, Education, Salon" adds +1 to
 * each of those three — and jury members are counted in each of their areas of
 * expertise the same way.
 *
 * Returns the rows together with the indexes of the title/section rows (for
 * styling) and the numeric breakdown sections that can back a simple chart.
 */

export type ChartSection = {
  title: string;
  /** Zero-based sheet row of the first metric row in this section. */
  firstDataRowIndex: number;
  /** Number of metric rows in this section. */
  rowCount: number;
};

export type StatsLayout = {
  rows: SheetValues;
  titleRowIndex: number;
  sectionRowIndexes: number[];
  chartSections: ChartSection[];
};

class StatsBuilder {
  readonly rows: SheetValues = [];
  readonly sectionRowIndexes: number[] = [];
  readonly chartSections: ChartSection[] = [];
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

  /**
   * Render a numeric breakdown (label → count). Entries are emitted in the
   * supplied order; empty breakdowns still render a section header so the
   * dashboard stays predictable. Pass `chart: true` to also register the section
   * as a chartable range (used for the category breakdowns, which read best as a
   * simple column chart).
   */
  breakdown(
    section: string,
    entries: Array<[string, number]>,
    options: { chart?: boolean } = {}
  ): void {
    this.section(section);
    const firstDataRowIndex = this.rows.length;
    for (const [label, count] of entries) this.metric(label, count);
    if (options.chart && entries.length > 0) {
      this.chartSections.push({
        title: section,
        firstDataRowIndex,
        rowCount: entries.length,
      });
    }
  }
}

/** Order category counts by the canonical order, dropping empty categories. */
function orderedCategoryCounts(counts: Map<string, number>): Array<[string, number]> {
  const entries: Array<[string, number]> = [];
  for (const name of CATEGORY_ORDER) {
    const count = counts.get(name) ?? 0;
    if (count > 0) entries.push([name, count]);
  }
  // Any non-canonical category names, appended after the known ones.
  for (const [name, count] of counts) {
    if (!CATEGORY_ORDER.includes(name as (typeof CATEGORY_ORDER)[number]) && count > 0) {
      entries.push([name, count]);
    }
  }
  return entries;
}

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export async function computeStatsLayout(): Promise<StatsLayout> {
  const [paidApplications, paidJury, tickets, paidRevenue] = await Promise.all([
    prisma.application.findMany({
      where: { paymentStatus: "PAID" },
      select: {
        category: { select: { name: true } },
        award: { select: { name: true } },
        nominationApplications: {
          select: {
            category: { select: { name: true } },
            award: { select: { name: true } },
          },
        },
      },
    }),
    prisma.juryApplication.findMany({
      where: { status: "PAID" },
      select: { expertiseAreas: true },
    }),
    prisma.ticket.findMany({
      select: { type: true, status: true },
    }),
    prisma.payment.groupBy({
      by: ["source"],
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const revenueBySource = (source: "COMPETITOR" | "JURY" | "TICKET"): number =>
    paidRevenue.find((row) => row.source === source)?._sum.amount ?? 0;

  const appRevenue = revenueBySource("COMPETITOR");
  const juryRevenue = revenueBySource("JURY");
  const ticketRevenue = revenueBySource("TICKET");
  const totalRevenue = appRevenue + juryRevenue + ticketRevenue;

  // Sold tickets exclude only the not-yet-paid / cancelled states.
  const soldTickets = tickets.filter(
    (t) => t.status !== "PENDING" && t.status !== "CANCELED"
  );

  // ── Multi-category / nomination breakdowns (each membership counts) ───────
  const appCategoryCounts = new Map<string, number>();
  const nominationCounts = new Map<string, number>();
  for (const app of paidApplications) {
    const categories = orderCategories([
      app.category.name,
      ...app.nominationApplications.map((nom) => nom.category.name),
    ]);
    for (const category of categories) increment(appCategoryCounts, category);

    const nominations =
      app.nominationApplications.length > 0
        ? app.nominationApplications.map((nom) => nom.award.name)
        : [app.award.name];
    for (const nomination of nominations) increment(nominationCounts, nomination);
  }

  const juryCategoryCounts = new Map<string, number>();
  for (const jury of paidJury) {
    for (const area of orderCategories(jury.expertiseAreas)) {
      increment(juryCategoryCounts, area);
    }
  }

  const ticketTypeCounts = new Map<string, number>();
  for (const ticket of soldTickets) {
    increment(ticketTypeCounts, ticketTypeLabelRu(ticket.type));
  }

  const now = formatDateTime(new Date());
  const builder = new StatsBuilder();

  builder.title("Статистика платформы IBPA");

  // ── Sync info ────────────────────────────────────────────────────────────
  builder.section("СИНХРОНИЗАЦИЯ");
  builder.metric("Время последней синхронизации", now);

  // ── Overview (paid only) ──────────────────────────────────────────────────
  builder.section("ОБЗОР");
  builder.metric("Оплаченные заявки", paidApplications.length);
  builder.metric("Оплаченные заявки судей", paidJury.length);
  builder.metric("Проданные билеты", soldTickets.length);
  builder.metric("Общий доход", formatUsd(totalRevenue));

  // ── Applications by category (multi-category counted in each) ─────────────
  builder.breakdown(
    "ЗАЯВКИ ПО КАТЕГОРИЯМ",
    orderedCategoryCounts(appCategoryCounts),
    { chart: true }
  );

  // ── Applications by nomination ────────────────────────────────────────────
  const nominationEntries = [...nominationCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  builder.breakdown("ЗАЯВКИ ПО НОМИНАЦИЯМ", nominationEntries);

  // ── Jury by category (areas of expertise, counted in each) ────────────────
  builder.breakdown(
    "СУДЬИ ПО КАТЕГОРИЯМ",
    orderedCategoryCounts(juryCategoryCounts),
    { chart: true }
  );

  // ── Tickets by type ───────────────────────────────────────────────────────
  const ticketTypeEntries = [...ticketTypeCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  builder.breakdown("БИЛЕТЫ ПО ТИПАМ", ticketTypeEntries);

  // ── Revenue by type ───────────────────────────────────────────────────────
  builder.section("ДОХОД ПО ТИПАМ");
  builder.metric("Заявки", formatUsd(appRevenue));
  builder.metric("Жюри", formatUsd(juryRevenue));
  builder.metric("Билеты", formatUsd(ticketRevenue));
  builder.metric("Общий доход", formatUsd(totalRevenue));

  return {
    rows: builder.rows,
    titleRowIndex: builder.titleRowIndex,
    sectionRowIndexes: builder.sectionRowIndexes,
    chartSections: builder.chartSections,
  };
}

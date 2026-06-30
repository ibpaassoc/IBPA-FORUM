import "server-only";
import { SHEET_TABS, type SheetTab } from "./config";
import { COLORS, type ColumnSpec, type ConditionalRule } from "./formatting";

/**
 * Declarative definition of each data tab: its columns (header + width + wrap),
 * which column holds the unique ID used for idempotent upserts, and the
 * status-based colour rules. The ID column is always the first column (index 0),
 * so re-running any sync updates existing rows in place instead of duplicating.
 *
 * Reviewer / internal admin identity is intentionally never represented here.
 */
export type SheetDefinition = {
  tab: SheetTab;
  /** Zero-based index of the unique-ID column (always the first column). */
  idColumnIndex: 0;
  columns: ColumnSpec[];
  /** Conditional row-colour rules, evaluated in order (first match wins). */
  conditionalRules: ConditionalRule[];
};

/** Column headers in order — derived from the column specs. */
export function sheetHeaders(definition: SheetDefinition): string[] {
  return definition.columns.map((column) => column.header);
}

// ── Applications ─────────────────────────────────────────────────────────────
// Removed per request: Applicant Type, Payment Status, Application Price.

export const APPLICATIONS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.applications,
  idColumnIndex: 0,
  columns: [
    { header: "Application ID", width: 130, wrap: "CLIP" },
    { header: "Applicant Name", width: 170, wrap: "WRAP" },
    { header: "Email", width: 210, wrap: "CLIP" },
    { header: "Phone", width: 140, wrap: "CLIP" },
    { header: "Instagram", width: 150, wrap: "CLIP" },
    { header: "Category", width: 160, wrap: "WRAP" },
    { header: "Nomination", width: 210, wrap: "WRAP" },
    { header: "IBPA Member", width: 100, wrap: "CLIP" },
    { header: "IBPA Number", width: 120, wrap: "CLIP" },
    { header: "Amount Paid", width: 120, wrap: "CLIP" },
    { header: "Application Status", width: 150, wrap: "CLIP" },
    { header: "Submitted Date", width: 150, wrap: "CLIP" },
    { header: "Updated Date", width: 150, wrap: "CLIP" },
    { header: "Reviewed Date", width: 150, wrap: "CLIP" },
    { header: "Score Summary", width: 170, wrap: "CLIP" },
  ],
  // Application Status is column index 10.
  conditionalRules: [
    { columnIndex: 10, equals: "Approved", color: COLORS.green },
    { columnIndex: 10, equals: "Rejected", color: COLORS.red },
    { columnIndex: 10, equals: "Payment Pending", color: COLORS.yellow },
    { columnIndex: 10, equals: "Submitted", color: COLORS.blue },
    { columnIndex: 10, equals: "Under Review", color: COLORS.blue },
    { columnIndex: 10, equals: "Draft", color: COLORS.gray },
  ],
};

// ── Jury ─────────────────────────────────────────────────────────────────────
// Removed per request: Checked In, Payment Status.

export const JURY_SHEET: SheetDefinition = {
  tab: SHEET_TABS.jury,
  idColumnIndex: 0,
  columns: [
    { header: "Jury Application ID", width: 130, wrap: "CLIP" },
    { header: "Full Name", width: 170, wrap: "WRAP" },
    { header: "Email", width: 210, wrap: "CLIP" },
    { header: "Phone", width: 140, wrap: "CLIP" },
    { header: "Instagram", width: 150, wrap: "CLIP" },
    { header: "Country", width: 130, wrap: "WRAP" },
    { header: "City", width: 130, wrap: "WRAP" },
    { header: "Professional Title", width: 200, wrap: "CLIP" },
    { header: "Years of Experience", width: 110, wrap: "CLIP" },
    { header: "Specialties", width: 220, wrap: "CLIP" },
    { header: "IBPA Member", width: 100, wrap: "CLIP" },
    { header: "IBPA Number", width: 120, wrap: "CLIP" },
    { header: "Jury Price", width: 110, wrap: "CLIP" },
    { header: "Application Status", width: 160, wrap: "CLIP" },
    { header: "Submitted Date", width: 150, wrap: "CLIP" },
    { header: "Updated Date", width: 150, wrap: "CLIP" },
    { header: "Reviewed Date", width: 150, wrap: "CLIP" },
    { header: "Notes", width: 240, wrap: "CLIP" },
  ],
  // Application Status is column index 13.
  conditionalRules: [
    { columnIndex: 13, equals: "Paid", color: COLORS.green },
    { columnIndex: 13, equals: "Approved", color: COLORS.green },
    { columnIndex: 13, equals: "Rejected", color: COLORS.red },
    { columnIndex: 13, equals: "Submitted", color: COLORS.yellow },
    { columnIndex: 13, equals: "Additional Info Required", color: COLORS.yellow },
  ],
};

// ── Scores ───────────────────────────────────────────────────────────────────

export const SCORES_SHEET: SheetDefinition = {
  tab: SHEET_TABS.scores,
  idColumnIndex: 0,
  columns: [
    { header: "Score ID", width: 130, wrap: "CLIP" },
    { header: "Application ID", width: 130, wrap: "CLIP" },
    { header: "Nomination ID", width: 130, wrap: "CLIP" },
    { header: "Jury Member ID", width: 130, wrap: "CLIP" },
    { header: "Jury Member Name", width: 170, wrap: "WRAP" },
    { header: "Applicant Name", width: 170, wrap: "WRAP" },
    { header: "Category", width: 160, wrap: "WRAP" },
    { header: "Technical", width: 90, wrap: "CLIP" },
    { header: "Aesthetic", width: 90, wrap: "CLIP" },
    { header: "Creativity", width: 90, wrap: "CLIP" },
    { header: "Impact", width: 80, wrap: "CLIP" },
    { header: "Presentation", width: 100, wrap: "CLIP" },
    { header: "Total Score", width: 90, wrap: "CLIP" },
    { header: "Average Score", width: 110, wrap: "CLIP" },
    { header: "Status", width: 110, wrap: "CLIP" },
    { header: "Comments", width: 280, wrap: "CLIP" },
    { header: "Submitted Date", width: 150, wrap: "CLIP" },
    { header: "Updated Date", width: 150, wrap: "CLIP" },
  ],
  // Status is column index 14.
  conditionalRules: [
    { columnIndex: 14, equals: "Submitted", color: COLORS.green },
    { columnIndex: 14, equals: "Reopened", color: COLORS.yellow },
    { columnIndex: 14, equals: "Draft", color: COLORS.gray },
  ],
};

// ── Tickets ──────────────────────────────────────────────────────────────────
// Trimmed to the requested payment-focused columns (no Gala/Stripe columns).

export const TICKETS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.tickets,
  idColumnIndex: 0,
  columns: [
    { header: "Ticket ID", width: 130, wrap: "CLIP" },
    { header: "Purchaser Name", width: 170, wrap: "WRAP" },
    { header: "Email", width: 210, wrap: "CLIP" },
    { header: "Phone", width: 140, wrap: "CLIP" },
    { header: "Instagram", width: 150, wrap: "CLIP" },
    { header: "Ticket Type", width: 160, wrap: "WRAP" },
    { header: "Quantity", width: 90, wrap: "CLIP" },
    { header: "Ticket Price", width: 110, wrap: "CLIP" },
    { header: "Total Paid", width: 110, wrap: "CLIP" },
    { header: "Discount", width: 110, wrap: "CLIP" },
    { header: "Payment Status", width: 130, wrap: "CLIP" },
    { header: "QR Code ID", width: 210, wrap: "CLIP" },
    { header: "Checked In", width: 100, wrap: "CLIP" },
    { header: "Check-in Time", width: 150, wrap: "CLIP" },
    { header: "Purchase Date", width: 150, wrap: "CLIP" },
    { header: "Updated Date", width: 150, wrap: "CLIP" },
  ],
  // Payment Status is column index 10; Checked In is column index 12. Canceled
  // and Pending take precedence over the checked-in / paid colours.
  conditionalRules: [
    { columnIndex: 10, equals: "Canceled", color: COLORS.red },
    { columnIndex: 10, equals: "Pending", color: COLORS.yellow },
    { columnIndex: 12, equals: "Yes", color: COLORS.green },
    { columnIndex: 10, equals: "Paid", color: COLORS.blue },
  ],
};

/** All upsert-style data tabs (the stats tab is handled separately). */
export const DATA_SHEETS: SheetDefinition[] = [
  APPLICATIONS_SHEET,
  JURY_SHEET,
  SCORES_SHEET,
  TICKETS_SHEET,
];

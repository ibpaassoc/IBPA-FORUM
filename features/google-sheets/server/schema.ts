import "server-only";
import { SHEET_TABS, type SheetTab } from "./config";

/**
 * Declarative definition of each data tab: its column headers and which column
 * holds the unique ID used for idempotent upserts. The ID column is always the
 * first column (index 0), so re-running any sync updates existing rows in place
 * instead of creating duplicates.
 */
export type SheetDefinition = {
  tab: SheetTab;
  headers: string[];
  /** Zero-based index of the unique-ID column (always the first column). */
  idColumnIndex: 0;
};

export const APPLICATIONS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.applications,
  idColumnIndex: 0,
  headers: [
    "Application ID",
    "Applicant Name",
    "Email",
    "Phone",
    "Instagram",
    "Category",
    "Nomination",
    "Applicant Type",
    "IBPA Member",
    "IBPA Number",
    "Application Price",
    "Amount Paid",
    "Payment Status",
    "Application Status",
    "Checked In",
    "Submitted Date",
    "Updated Date",
    "Score Summary",
  ],
};

export const JURY_SHEET: SheetDefinition = {
  tab: SHEET_TABS.jury,
  idColumnIndex: 0,
  headers: [
    "Jury Application ID",
    "Full Name",
    "Email",
    "Phone",
    "Instagram",
    "Country",
    "City",
    "Professional Title",
    "Years of Experience",
    "Specialties",
    "IBPA Member",
    "IBPA Number",
    "Jury Price",
    "Payment Status",
    "Application Status",
    "Checked In",
    "Submitted Date",
    "Updated Date",
    "Reviewed Date",
    "Notes",
  ],
};

export const SCORES_SHEET: SheetDefinition = {
  tab: SHEET_TABS.scores,
  idColumnIndex: 0,
  headers: [
    "Score ID",
    "Application ID",
    "Nomination ID",
    "Jury Member ID",
    "Jury Member Name",
    "Applicant Name",
    "Category",
    "Technical",
    "Aesthetic",
    "Creativity",
    "Impact",
    "Presentation",
    "Total Score",
    "Average Score",
    "Status",
    "Comments",
    "Submitted Date",
    "Updated Date",
  ],
};

export const TICKETS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.tickets,
  idColumnIndex: 0,
  headers: [
    "Ticket ID",
    "Purchaser Name",
    "Email",
    "Phone",
    "Instagram",
    "Ticket Type",
    "Gala Dinner",
    "Quantity",
    "Ticket Price",
    "Discount",
    "Total Paid",
    "Payment Status",
    "Stripe Payment ID",
    "QR Code ID",
    "Checked In",
    "Check-in Time",
    "Purchase Date",
    "Updated Date",
  ],
};

/** All upsert-style data tabs (the stats tab is handled separately). */
export const DATA_SHEETS: SheetDefinition[] = [
  APPLICATIONS_SHEET,
  JURY_SHEET,
  SCORES_SHEET,
  TICKETS_SHEET,
];

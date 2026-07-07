/**
 * Shared types for the unified ticket check-in / QR scanner.
 *
 * One scanner handles every IBPA "ticket-like" record. A `TicketKind`
 * identifies which source table a scanned code resolves to, and a
 * `CheckInScope` identifies which check-in event is being recorded (a single
 * forum ticket can be checked in for both forum entry and the gala dinner).
 */

export type TicketKind = "TICKET" | "PARTICIPANT" | "JURY";

export type CheckInScope = "FORUM" | "GALA" | "ATTENDANCE";

/**
 * Scanner access modes. The operator picks one at the event entrance and it
 * gates which forum tickets may be checked in:
 *   - `one_day`     — only 1-day forum passes
 *   - `two_day`     — only 2-day forum passes
 *   - `gala_dinner` — only tickets that include the gala dinner
 * These are the canonical string values used across the client, API and DB layer.
 */
export const SCAN_MODES = ["one_day", "two_day", "gala_dinner"] as const;

export type ScanMode = (typeof SCAN_MODES)[number];

export type CheckInStatus = "CHECKED_IN" | "NOT_CHECKED_IN";

export type PaymentStatusValue = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

/** A single check-in event available on a resolved ticket. */
export type CheckInScopeState = {
  scope: CheckInScope;
  label: string;
  checkedInAt: string | null;
};

/**
 * Normalized, privacy-safe view of any ticket-like record returned by the
 * verification endpoint. Never exposes raw source rows.
 */
export type NormalizedTicket = {
  ticketKind: TicketKind;
  ticketType: string;
  ownerName: string;
  email: string;
  phone: string | null;
  status: string;
  paymentStatus: PaymentStatusValue;
  checkInStatus: CheckInStatus;
  scopes: CheckInScopeState[];
  /**
   * Scan modes this record qualifies for. Forum tickets resolve to their day
   * pass plus `gala_dinner` when included; participant/jury records return an
   * empty list (mode gating does not apply to them).
   */
  accessTypes: ScanMode[];
  /** True when payment cleared and the ticket may be checked in. */
  eligibleForCheckIn: boolean;
  sourceRecordId: string;
  /** Normalized code the client echoes back when confirming a check-in. */
  code: string;
};

export type VerifyResponse = { ticket: NormalizedTicket };

export type CheckInRequest = {
  ticketKind: TicketKind;
  sourceRecordId: string;
  scope: CheckInScope;
  /**
   * Selected scanner mode. When present on a forum ticket it is authoritative:
   * the server validates the ticket qualifies for the mode and derives the
   * check-in scope from it. Absent for participant/jury check-ins.
   */
  mode?: ScanMode;
};

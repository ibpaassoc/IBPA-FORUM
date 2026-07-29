/**
 * Shared types for the unified ticket check-in / QR scanner.
 *
 * One scanner handles every IBPA "ticket-like" record. A `TicketKind`
 * identifies which source table a scanned code resolves to, and a
 * `CheckInScope` identifies which event entry is being recorded.
 */

export type TicketKind = "TICKET" | "PARTICIPANT" | "JURY";

export const CHECK_IN_SCOPES = ["DAY_ONE", "DAY_TWO", "GALA", "ATTENDANCE"] as const;
export type CheckInScope = (typeof CHECK_IN_SCOPES)[number];

export type CheckInStatus = "CHECKED_IN" | "NOT_CHECKED_IN";

export type PaymentStatusValue = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

/** A single check-in event available on a resolved ticket. */
export type CheckInScopeState = {
  scope: CheckInScope;
  label: string;
  checkedInAt: string | null;
  available: boolean;
  unavailableReason: string | null;
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
  /** Null for participant and jury records, where the add-on does not apply. */
  galaDinnerIncluded: boolean | null;
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
};

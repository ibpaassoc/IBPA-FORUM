import "server-only";
import type { JuryReviewStatus, TicketType } from "@prisma/client";

/**
 * Russian labels for the system-generated enum values that surface in the
 * spreadsheet. Kept local to the Google Sheets feature so translating the sheet
 * never changes the wording shown on public pages, emails, or the admin UI.
 *
 * The conditional-format status colours in `schema.ts` key off these exact
 * strings, so any label edited here must be mirrored in the matching rule.
 *
 * The Applications and Jury tabs no longer carry a status column (they only ever
 * show paid records), so their status labels were removed.
 */

const SCORE_STATUS_RU: Record<JuryReviewStatus, string> = {
  NOT_STARTED: "Не начата",
  IN_PROGRESS: "Черновик",
  COMPLETED: "Отправлена",
  LOCKED: "Заблокирована",
};

// Ticket-type labels are duplicated (in Russian) here rather than reusing the
// shared `ticketTypeLabel`, whose English wording is shown on the payment page
// and confirmation email and must stay unchanged.
const TICKET_TYPE_RU: Record<TicketType, string> = {
  ONE_DAY: "Форум — 1 день",
  TWO_DAYS: "Форум — 2 дня",
};

export function scoreStatusLabel(status: JuryReviewStatus): string {
  return SCORE_STATUS_RU[status] ?? String(status);
}

export function ticketTypeLabelRu(type: TicketType): string {
  return TICKET_TYPE_RU[type] ?? String(type);
}

/** Russian payment label for a ticket derived from its status. */
export function ticketPaymentLabel(status: "CANCELED" | "PENDING" | string): string {
  if (status === "CANCELED") return "Отменён";
  if (status === "PENDING") return "Ожидает";
  return "Оплачен";
}

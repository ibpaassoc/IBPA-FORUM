export const TICKET_PAYMENT_PLANS = ["FULL", "TWO_INSTALLMENTS"] as const;

export type TicketPaymentPlan = (typeof TICKET_PAYMENT_PLANS)[number];

export const SECOND_INSTALLMENT_DELAY_DAYS = 14;
export const SECOND_INSTALLMENT_DELAY_SECONDS =
  SECOND_INSTALLMENT_DELAY_DAYS * 24 * 60 * 60;

/**
 * The first charge receives the lower half-cent when an order total is odd,
 * and the automatic second charge receives the remainder.
 */
export function splitTicketTotalIntoTwoPayments(totalCents: number) {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) {
    throw new Error("Ticket total must be a non-negative integer number of cents.");
  }

  const firstAmountCents = Math.floor(totalCents / 2);
  return {
    firstAmountCents,
    secondAmountCents: totalCents - firstAmountCents,
  };
}

export function getSecondInstallmentDate(from: Date) {
  return new Date(from.getTime() + SECOND_INSTALLMENT_DELAY_SECONDS * 1000);
}

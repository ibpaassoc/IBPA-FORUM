import { buildTextBody, ctaButton, wrapEmail } from "@/features/email/templates/layout";

type TicketPaymentLinkParams = {
  fullName: string;
  ticketSummary: string;
  amountFormatted: string;
  checkoutUrl: string;
};

/**
 * Email sent when an admin generates a fresh payment link for an unpaid ticket.
 * Uses the shared IBPA email layout. Contains only customer-safe details — no
 * ticket ids, Stripe session ids, or other internal data.
 */
export function ticketPaymentLinkTemplate({
  fullName,
  ticketSummary,
  amountFormatted,
  checkoutUrl,
}: TicketPaymentLinkParams) {
  const greeting = fullName.trim() ? `Dear ${fullName.trim()},` : "Hello,";

  const paragraphs = [
    greeting,
    "Here is a fresh, secure link to complete your ticket payment for the Beauty Business Forum.",
    `Your selection: ${ticketSummary}`,
    `Amount due: ${amountFormatted}`,
    ctaButton("Complete Payment", checkoutUrl),
    "Please note: any earlier payment link you may have received will no longer work — please use the button above.",
  ];

  return {
    subject: "Complete Your Payment — IBPA BEAUTY AWARD 2026",
    html: wrapEmail("Complete your ticket payment", paragraphs),
    text: buildTextBody([
      greeting,
      "Here is a fresh, secure link to complete your ticket payment for the Beauty Business Forum.",
      `Your selection: ${ticketSummary}`,
      `Amount due: ${amountFormatted}`,
      checkoutUrl,
      "Please note: any earlier payment link you may have received will no longer work.",
    ]),
  };
}

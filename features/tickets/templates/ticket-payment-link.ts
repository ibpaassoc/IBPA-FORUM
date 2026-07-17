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
    "Use the secure link below to complete your ticket payment for the IBPA Beauty Business Forum.",
    `Your selection: ${ticketSummary}`,
    `Amount due: ${amountFormatted}`,
    ctaButton("Complete Payment", checkoutUrl),
    "Any payment link we sent previously is no longer valid. Please use the button above.",
  ];

  return {
    subject: "Complete Your IBPA Forum Ticket Payment",
    html: wrapEmail("Complete your ticket payment", paragraphs),
    text: buildTextBody([
      greeting,
      "Use the secure link below to complete your ticket payment for the IBPA Beauty Business Forum.",
      `Your selection: ${ticketSummary}`,
      `Amount due: ${amountFormatted}`,
      checkoutUrl,
      "Any payment link we sent previously is no longer valid. Please use the link above.",
    ]),
  };
}

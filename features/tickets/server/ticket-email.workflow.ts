import "server-only";
import type { TicketType } from "@prisma/client";
import { getAppUrl } from "@/features/payments/server/stripe-client";
import { sendEmail, type SendEmailResult } from "@/features/email/server/send-email";
import { ticketConfirmationTemplate, QR_CID } from "../templates/ticket-confirmation";
import { ticketPaymentLinkTemplate } from "../templates/ticket-payment-link";
import { TICKET_TYPE_LABELS } from "@/features/tickets/lib/labels";
import { generateTicketQRBuffer } from "./ticket-qr";

export async function sendTicketConfirmationEmail({
  to,
  fullName,
  type,
  galaDinner,
  secureToken,
  instagram,
  accessUpdated = false,
}: {
  to: string;
  fullName: string;
  type: TicketType;
  galaDinner: boolean;
  secureToken: string;
  instagram?: string | null;
  accessUpdated?: boolean;
}) {
  const qrBuffer = await generateTicketQRBuffer(secureToken);
  const paymentUrl = `${getAppUrl()}/tickets/${secureToken}`;
  const template = ticketConfirmationTemplate({
    fullName,
    type,
    galaDinner,
    paymentUrl,
    instagram,
    accessUpdated,
  });

  return sendEmail({
    type: "user",
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    attachments: [
      {
        filename: "ticket-qr.png",
        content: qrBuffer,
        content_id: QR_CID,
      },
    ],
  });
}

export const sendTicketQrEmail = sendTicketConfirmationEmail;

/**
 * Send an unpaid ticket holder a fresh payment link (admin resend flow).
 * Returns the delivery result so the caller can refuse to report success — and
 * must never mark the ticket paid — when the email did not go out.
 */
export async function sendTicketPaymentLinkEmail({
  to,
  fullName,
  type,
  galaDinner,
  amountCents,
  currency,
  checkoutUrl,
}: {
  to: string;
  fullName: string;
  type: TicketType;
  galaDinner: boolean;
  amountCents: number;
  currency: string;
  checkoutUrl: string;
}): Promise<SendEmailResult> {
  const ticketSummary = `${TICKET_TYPE_LABELS[type]}${galaDinner ? " + Gala Dinner" : ""}`;
  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);

  const template = ticketPaymentLinkTemplate({
    fullName,
    ticketSummary,
    amountFormatted,
    checkoutUrl,
  });

  return sendEmail({
    type: "user",
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

import { wrapEmail, buildTextBody } from "@/features/email/templates/layout";
import type { TicketType } from "@prisma/client";

const TICKET_LABELS: Record<TicketType, string> = {
  ONE_DAY: "1-Day Forum Pass",
  TWO_DAYS: "2-Day Forum Pass",
};

const QR_CID = "ticket-qr";

type TicketConfirmationParams = {
  fullName: string;
  type: TicketType;
  galaDinner: boolean;
};

export { QR_CID };

export function ticketConfirmationTemplate({
  fullName,
  type,
  galaDinner,
}: TicketConfirmationParams) {
  const ticketLabel = TICKET_LABELS[type];
  const galaLine = galaDinner ? "Included" : "Not included";

  const blocks = [
    `Dear ${fullName},`,
    "Your ticket for the <strong>Beauty Business Forum USA 2026</strong> has been confirmed and payment received.",
    `<strong>Ticket type:</strong> ${ticketLabel}<br/><strong>Gala Dinner:</strong> ${galaLine}`,
    "Please show the QR code below at the forum check-in desk on arrival.",
    `<div style="text-align:center;margin:28px 0;"><img src="cid:${QR_CID}" alt="Your ticket QR code" width="220" height="220" style="border-radius:12px;border:1px solid rgba(3,2,19,0.1);padding:8px;background:#fff;" /></div>`,
    "We look forward to welcoming you to the forum!",
    "— The IBPA Forum Team",
  ];

  const textLines = [
    `Dear ${fullName},`,
    "Your ticket for the Beauty Business Forum USA 2026 has been confirmed.",
    `Ticket type: ${ticketLabel}`,
    `Gala Dinner: ${galaLine}`,
    "Please show this QR code at the forum check-in desk. If you cannot see the QR code, open this email in an HTML-capable client.",
    "We look forward to welcoming you to the forum!",
    "— The IBPA Forum Team",
  ];

  return {
    subject: "Your Ticket Is Confirmed — Beauty Business Forum USA 2026",
    html: wrapEmail("Your ticket is confirmed", blocks),
    text: buildTextBody(textLines),
  };
}

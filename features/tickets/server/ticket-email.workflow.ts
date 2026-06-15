import "server-only";
import type { TicketType } from "@prisma/client";
import { sendEmail } from "@/features/email/server/send-email";
import { ticketConfirmationTemplate } from "../templates/ticket-confirmation";
import { generateTicketQRDataUrl } from "./ticket-qr";

export async function sendTicketConfirmationEmail({
  to,
  fullName,
  type,
  galaDinner,
  secureToken,
}: {
  to: string;
  fullName: string;
  type: TicketType;
  galaDinner: boolean;
  secureToken: string;
}) {
  const qrDataUrl = await generateTicketQRDataUrl(secureToken);
  const template = ticketConfirmationTemplate({ fullName, type, galaDinner, qrDataUrl });

  return sendEmail({
    type: "user",
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

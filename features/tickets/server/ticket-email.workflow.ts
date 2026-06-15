import "server-only";
import type { TicketType } from "@prisma/client";
import { getAppUrl } from "@/features/payments/server/stripe-client";
import { sendEmail } from "@/features/email/server/send-email";
import { ticketConfirmationTemplate, QR_CID } from "../templates/ticket-confirmation";
import { generateTicketQRBuffer } from "./ticket-qr";

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
  const qrBuffer = await generateTicketQRBuffer(secureToken);
  const paymentUrl = `${getAppUrl()}/tickets/${secureToken}`;
  const template = ticketConfirmationTemplate({ fullName, type, galaDinner, paymentUrl });

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

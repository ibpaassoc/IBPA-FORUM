import type { TicketType } from "@prisma/client";

export const QR_CID = "ticket-qr";

const TICKET_LABELS: Record<TicketType, string> = {
  ONE_DAY: "1-Day Forum Pass",
  TWO_DAYS: "2-Day Forum Pass",
};

type TicketConfirmationParams = {
  fullName: string;
  type: TicketType;
  galaDinner: boolean;
};

export function ticketConfirmationTemplate({
  fullName,
  type,
  galaDinner,
}: TicketConfirmationParams) {
  const ticketLabel = TICKET_LABELS[type];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1120;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:28px;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#72a0c1;">
              Beauty Business Forum USA
            </p>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;padding:40px 36px;">

            <!-- Title -->
            <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;line-height:1.2;color:#0d1120;">
              Your ticket is confirmed
            </h1>
            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;">
              Payment received — see you at the forum!
            </p>

            <!-- Divider -->
            <div style="height:1px;background:#e5e7eb;margin-bottom:28px;"></div>

            <!-- Greeting -->
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
              Dear <strong>${fullName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
              Your registration for the <strong>Beauty Business Forum USA 2026</strong> is complete.
              Below are your ticket details and the QR code you'll use to check in on the day of the event.
            </p>

            <!-- Ticket details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
              <tr>
                <td style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;padding-bottom:14px;" colspan="2">
                  Ticket Details
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;padding-bottom:8px;width:40%;">Ticket Type</td>
                <td style="font-size:13px;font-weight:600;color:#111827;padding-bottom:8px;">${ticketLabel}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;">Gala Dinner</td>
                <td style="font-size:13px;font-weight:600;color:#111827;">${galaDinner ? "✓ Included" : "Not included"}</td>
              </tr>
            </table>

            <!-- QR code -->
            <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#374151;text-align:center;">
              Show this QR code at the check-in desk
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <img
                src="cid:${QR_CID}"
                alt="Your ticket QR code"
                width="200"
                height="200"
                style="border-radius:12px;border:1px solid #e5e7eb;padding:10px;background:#fff;"
              />
            </div>

            <!-- Divider -->
            <div style="height:1px;background:#e5e7eb;margin-bottom:24px;"></div>

            <!-- Footer note -->
            <p style="margin:0;font-size:13px;line-height:1.65;color:#9ca3af;">
              If you have any questions, reply to this email or contact us at
              <a href="mailto:forum@ibpa.global" style="color:#72a0c1;text-decoration:none;">forum@ibpa.global</a>.
              We look forward to welcoming you to the forum!
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:24px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#4b5563;">
              © 2026 International Beauty Professional Association · Beauty Business Forum USA
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Dear ${fullName},`,
    `Your ticket for the Beauty Business Forum USA 2026 is confirmed.`,
    `Ticket type: ${ticketLabel}`,
    `Gala Dinner: ${galaDinner ? "Included" : "Not included"}`,
    `Please show the attached QR code at the check-in desk on arrival.`,
    `Questions? Contact us at forum@ibpa.global`,
    `© 2026 International Beauty Professional Association`,
  ].join("\n\n");

  return {
    subject: "Your Ticket Is Confirmed — Beauty Business Forum USA 2026",
    html,
    text,
  };
}

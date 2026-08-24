import type { TicketType } from "@prisma/client";
import { TICKET_TYPE_LABELS } from "@/features/tickets/lib/labels";

export const QR_CID = "ticket-qr";

type TicketConfirmationParams = {
  fullName: string;
  type: TicketType;
  galaDinner: boolean;
  paymentUrl: string;
  instagram?: string | null;
  accessUpdated?: boolean;
  specialPacket?: boolean;
  specialOffer?: boolean;
  manualIssue?: boolean;
};

export function ticketConfirmationTemplate({
  fullName,
  type,
  galaDinner,
  paymentUrl,
  instagram,
  accessUpdated = false,
  specialPacket = false,
  specialOffer = false,
  manualIssue = false,
}: TicketConfirmationParams) {
  const ticketLabel = specialPacket
    ? "Special Packet — 2-Day Forum Pass"
    : specialOffer
      ? "Special Offer — 2-Day Forum Pass"
      : manualIssue
        ? type === "ONE_DAY"
          ? "Форум — 1 день"
          : "Форум — 2 дня"
        : TICKET_TYPE_LABELS[type];
  const instagramRow = instagram
    ? `
              <tr>
                <td style="font-size:13px;color:#6b7280;padding-top:8px;">Instagram</td>
                <td style="font-size:13px;font-weight:600;color:#111827;padding-top:8px;">@${instagram}</td>
              </tr>`
    : "";

  if (manualIssue) {
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1120;font-family:Lora,Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding-bottom:28px;"><p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#72a0c1;">IBPA BEAUTY AWARD 2026</p></td></tr>
        <tr><td style="background:#ffffff;border-radius:16px;padding:40px 36px;">
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;line-height:1.2;color:#0d1120;">Ваш билет подтверждён</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#6b7280;">Билет оформлен без оплаты.</p>
          <div style="height:1px;background:#e5e7eb;margin-bottom:28px;"></div>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">Здравствуйте, <strong>${fullName}</strong>!</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">Ваш билет на <strong>IBPA BEAUTY AWARD 2026</strong> готов. Данные билета и QR-код для регистрации указаны ниже.</p>
          ${
            accessUpdated
              ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#374151;background:#f2f8fb;border:1px solid #dbeafe;border-radius:10px;padding:14px 16px;">Данные билета обновлены. Используйте этот QR-код на мероприятии: ранее отправленный QR-код больше не действует.</p>`
              : ""
          }
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
            <tr><td style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;padding-bottom:14px;" colspan="2">Данные билета</td></tr>
            <tr><td style="font-size:13px;color:#6b7280;padding-bottom:8px;width:40%;">Тип билета</td><td style="font-size:13px;font-weight:600;color:#111827;padding-bottom:8px;">${ticketLabel}</td></tr>
            <tr><td style="font-size:13px;color:#6b7280;">Гала-ужин</td><td style="font-size:13px;font-weight:600;color:#111827;">${galaDinner ? "✓ Включён" : "Не включён"}</td></tr>${instagramRow}
          </table>
          <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#374151;text-align:center;">Покажите этот QR-код на стойке регистрации</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center"><img src="cid:${QR_CID}" alt="QR-код билета" width="200" height="200" border="0" style="display:block;width:200px;height:200px;border-radius:12px;border:1px solid #e5e7eb;padding:10px;background:#ffffff;" /></td></tr></table>
          <div style="text-align:center;margin-bottom:28px;"><a href="${paymentUrl}" style="display:inline-block;font-size:13px;font-weight:600;color:#72a0c1;text-decoration:none;border:1px solid #72a0c1;border-radius:8px;padding:10px 22px;">Открыть билет →</a></div>
          <div style="height:1px;background:#e5e7eb;margin-bottom:24px;"></div>
          <p style="margin:0;font-size:13px;line-height:1.65;color:#9ca3af;">По вопросам напишите нам на <a href="mailto:forum@ibpa.global" style="color:#72a0c1;text-decoration:none;">forum@ibpa.global</a>.</p>
        </td></tr>
        <tr><td style="padding-top:24px;text-align:center;"><p style="margin:0;font-size:11px;color:#4b5563;">© 2026 International Beauty Professional Association · IBPA BEAUTY AWARD 2026</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const text = [
      `Здравствуйте, ${fullName}!`,
      "Ваш билет на IBPA BEAUTY AWARD 2026 готов. Оплата не требуется.",
      `Тип билета: ${ticketLabel}`,
      `Гала-ужин: ${galaDinner ? "Включён" : "Не включён"}`,
      ...(accessUpdated
        ? ["Данные билета обновлены. Используйте новый QR-код: ранее отправленный QR-код больше не действует."]
        : []),
      ...(instagram ? [`Instagram: @${instagram}`] : []),
      "Покажите QR-код из письма на стойке регистрации.",
      `Открыть билет: ${paymentUrl}`,
      "Вопросы: forum@ibpa.global",
    ].join("\n\n");

    return {
      subject: "Ваш билет подтверждён — IBPA BEAUTY AWARD 2026",
      html,
      text,
    };
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1120;font-family:Lora,Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:28px;">
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#72a0c1;">
              IBPA BEAUTY AWARD 2026
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
              Payment received. We look forward to welcoming you!
            </p>

            <!-- Divider -->
            <div style="height:1px;background:#e5e7eb;margin-bottom:28px;"></div>

            <!-- Greeting -->
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
              Dear <strong>${fullName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">
              Your registration for the <strong>IBPA BEAUTY AWARD 2026</strong> is complete.
              Your ticket details and check-in QR code are below.
            </p>
            ${
              accessUpdated
                ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#374151;background:#f2f8fb;border:1px solid #dbeafe;border-radius:10px;padding:14px 16px;">
              Your ticket details have been updated. Please use this new QR code at the event; any QR code we sent previously is no longer valid.
            </p>`
                : ""
            }

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
              </tr>${instagramRow}
            </table>

            <!-- QR code -->
            <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#374151;text-align:center;">
              Show this QR code at the check-in desk
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <img
                    src="cid:${QR_CID}"
                    alt="Your ticket QR code"
                    width="200"
                    height="200"
                    border="0"
                    style="display:block;width:200px;height:200px;border-radius:12px;border:1px solid #e5e7eb;padding:10px;background:#ffffff;"
                  />
                </td>
              </tr>
            </table>

            <!-- Payment details link -->
            <div style="text-align:center;margin-bottom:28px;">
              <a
                href="${paymentUrl}"
                style="display:inline-block;font-size:13px;font-weight:600;color:#72a0c1;text-decoration:none;border:1px solid #72a0c1;border-radius:8px;padding:10px 22px;"
              >
                View Ticket Details →
              </a>
            </div>

            <!-- Divider -->
            <div style="height:1px;background:#e5e7eb;margin-bottom:24px;"></div>

            <!-- Footer note -->
            <p style="margin:0;font-size:13px;line-height:1.65;color:#9ca3af;">
              If you have any questions, reply to this email or contact us at
              <a href="mailto:forum@ibpa.global" style="color:#72a0c1;text-decoration:none;">forum@ibpa.global</a>.
              We look forward to seeing you at the forum.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:24px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#4b5563;">
              © 2026 International Beauty Professional Association · IBPA BEAUTY AWARD 2026
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
    `Your registration for the IBPA BEAUTY AWARD 2026 is complete.`,
    `Ticket type: ${ticketLabel}`,
    `Gala Dinner: ${galaDinner ? "Included" : "Not included"}`,
    ...(accessUpdated
      ? [
          "Your ticket details have been updated. Please use this new QR code at the event; any QR code we sent previously is no longer valid.",
        ]
      : []),
    ...(instagram ? [`Instagram: @${instagram}`] : []),
    `Please show the QR code in this email at the check-in desk when you arrive.`,
    `View your ticket details: ${paymentUrl}`,
    `Questions? Contact us at forum@ibpa.global.`,
    `© 2026 International Beauty Professional Association`,
  ].join("\n\n");

  return {
    subject: "Your Ticket Is Confirmed — IBPA BEAUTY AWARD 2026",
    html,
    text,
  };
}

import "server-only";

import { getAppUrl } from "@/features/payments/server/stripe-client";
import { sendEmail } from "@/features/email/server/send-email";
import { generateTicketQRBuffer } from "@/features/tickets/server/ticket-qr";
import type { NotificationType } from "@prisma/client";

const QR_CID = "jury-gala-qr";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

export async function sendNewNotificationEmail({
  to,
  fullName,
  role,
}: {
  to: string;
  fullName: string;
  role: NotificationType;
}) {
  const accountPath = role === "JURY" ? "/account/jury/notifications" : "/account/applicant/notifications";
  const accountUrl = `${getAppUrl()}${accountPath}`;
  const safeName = escapeHtml(fullName);
  const html = `<!doctype html><html><body style="margin:0;background:#f2f8fb;font-family:Arial,sans-serif;color:#252a2d"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:560px;background:#fff;border-radius:20px;padding:36px"><tr><td><p style="margin:0 0 8px;color:#72a0c1;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">IBPA Beauty Award 2026</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:400">You have a new notification</h1><p style="line-height:1.65">Hello ${safeName},</p><p style="line-height:1.65">Look at your account — you have a new notification waiting for you.</p><p style="text-align:center;margin:28px 0"><a href="${accountUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#72a0c1;color:white;text-decoration:none;font-weight:700">View notification</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = `Hello ${fullName},\n\nLook at your account — you have a new notification waiting for you.\n\nView your notification: ${accountUrl}`;

  return sendEmail({
    type: "user",
    to,
    subject: "You have a new notification in your IBPA account",
    html,
    text,
    templateType: "new_account_notification",
  });
}

export async function sendJuryGalaQrEmail({
  to,
  fullName,
  secureToken,
}: {
  to: string;
  fullName: string;
  secureToken: string;
}) {
  const accountUrl = `${getAppUrl()}/account/jury/notifications`;
  const qrBuffer = await generateTicketQRBuffer(secureToken);
  const html = `<!doctype html><html><body style="margin:0;background:#f2f8fb;font-family:Arial,sans-serif;color:#252a2d"><table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table width="100%" style="max-width:560px;background:#fff;border-radius:20px;padding:36px"><tr><td><p style="margin:0 0 8px;color:#72a0c1;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">IBPA Beauty Award 2026</p><h1 style="margin:0 0 18px;font-family:Georgia,serif;font-weight:400">Your Gala Dinner ticket</h1><p style="line-height:1.65">Dear ${fullName},</p><p style="line-height:1.65">Your complimentary Gala Dinner place is confirmed. This QR code is valid for <strong>Gala Dinner entry only</strong> and does not include either Forum day.</p><p style="text-align:center;margin:28px 0"><img src="cid:${QR_CID}" width="220" height="220" alt="Gala Dinner QR code" style="padding:10px;border:1px solid #d9e8f0;border-radius:14px"></p><p style="text-align:center"><a href="${accountUrl}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#72a0c1;color:white;text-decoration:none;font-weight:700">View notification</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = `Dear ${fullName},\n\nYour complimentary Gala Dinner place is confirmed. The attached QR code is valid for Gala Dinner entry only and does not include either Forum day.\n\nView your notification: ${accountUrl}`;

  return sendEmail({
    type: "user",
    to,
    subject: "Your complimentary Gala Dinner QR code — IBPA 2026",
    html,
    text,
    attachments: [{ filename: "ibpa-gala-dinner-qr.png", content: qrBuffer, contentId: QR_CID }],
    templateType: "jury_gala_qr",
  });
}

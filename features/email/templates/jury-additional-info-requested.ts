import { buildTextBody, ctaButton, wrapEmail } from "@/features/email/templates/layout";

export function juryAdditionalInfoRequested({
  fullName,
  details,
  actionUrl,
}: {
  fullName: string;
  details: string;
  actionUrl: string;
}) {
  const escapedDetails = details.replace(/\n/g, "<br/>");

  return {
    subject: "Action Required: Update Your IBPA Jury Application",
    html: wrapEmail("Please update your jury application", [
      `Dear ${fullName},`,
      "Thank you for applying to join the IBPA Beauty Award jury panel. Before we complete our review, we need some additional information from you.",
      `<div style="margin:8px 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#252a2d;">What we need from you</div><div style="padding:16px 20px;background:#faf9f7;border:1px solid rgba(184,151,110,0.35);border-radius:12px;font-size:14px;line-height:1.75;color:#46525a;">${escapedDetails}</div>`,
      ctaButton("Update My Application", actionUrl),
      "Use the secure link above to update your application. This link is unique to you, so please do not share it.",
      "If you have any questions, please reply to this email or contact us at forum-support@ibpassociations.org.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "Thank you for applying to join the IBPA Beauty Award jury panel.",
      "Before we complete our review, we need some additional information from you.",
      "What we need from you:",
      details,
      "Update your application using this secure link:",
      actionUrl,
      "This link is unique to you, so please do not share it.",
      "If you have any questions, please contact us at forum-support@ibpassociations.org.",
    ]),
  };
}

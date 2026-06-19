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
    subject: "Action Required: Additional Information Needed for Your IBPA Jury Application",
    html: wrapEmail("Additional information required", [
      `Dear ${fullName},`,
      "Thank you for applying to serve as a judge for the IBPA Beauty Award. Our review committee has carefully examined your application and requires some additional information before reaching a final decision.",
      `<div style="margin:8px 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;color:#252a2d;">What we need from you</div><div style="padding:16px 20px;background:#faf9f7;border:1px solid rgba(184,151,110,0.35);border-radius:12px;font-size:14px;line-height:1.75;color:#46525a;">${escapedDetails}</div>`,
      ctaButton("Update My Application", actionUrl),
      "Please use the secure link above to access your application and provide the requested information. The link is personal — do not share it.",
      "If you have any questions, please reply to this email or contact us at forum-support@ibpassociations.org.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "Thank you for applying to serve as a judge for the IBPA Beauty Award.",
      "Our review committee requires some additional information before reaching a final decision.",
      "What we need from you:",
      details,
      "Please update your application using the secure link below:",
      actionUrl,
      "The link is personal — do not share it.",
      "If you have any questions, please contact us at forum-support@ibpassociations.org.",
    ]),
  };
}

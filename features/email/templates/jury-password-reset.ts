import { buildTextBody, ctaButton, wrapEmail } from "@/features/email/templates/layout";

export function juryPasswordReset({ resetUrl }: { resetUrl: string }) {
  const paragraphs = [
    "We received a request to reset the password for your IBPA Beauty Award jury account.",
    "Click the button below to set a new password. This link is valid for 1 hour.",
    ctaButton("Reset Password", resetUrl),
    "If you did not request this, please ignore this email. Your password will remain unchanged.",
  ];

  return {
    subject: "Reset Your IBPA Jury Account Password",
    html: wrapEmail("Reset your password", paragraphs),
    text: buildTextBody([
      "We received a request to reset the password for your IBPA Beauty Award jury account.",
      "Use the following link to set a new password. The link is valid for 1 hour:",
      resetUrl,
      "If you did not request this, you can ignore this email. Your password will remain unchanged.",
    ]),
  };
}

import { buildTextBody, ctaButton, wrapEmail } from "@/features/email/templates/layout";

export function juryPasswordReset({ resetUrl }: { resetUrl: string }) {
  const paragraphs = [
    "You requested a password reset for your IBPA Beauty Award 2026 jury account.",
    "Click the button below to set a new password. This link is valid for 1 hour.",
    ctaButton("Reset Password", resetUrl),
    "If you did not request this, please ignore this email. Your password will remain unchanged.",
  ];

  return {
    subject: "IBPA Jury — Password Reset Request",
    html: wrapEmail("Password Reset Request", paragraphs),
    text: buildTextBody([
      "You requested a password reset for your IBPA Beauty Award 2026 jury account.",
      "Visit the following link to set a new password (valid for 1 hour):",
      resetUrl,
      "If you did not request this, please ignore this email.",
    ]),
  };
}

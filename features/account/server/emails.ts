import "server-only";

import { readEnv } from "@/lib/env";
import { sendEmail } from "@/features/email/server/send-email";
import { buildTextBody, ctaButton, wrapEmail } from "@/features/email/templates/layout";

function getAppUrl() {
  return readEnv(["APP_URL", "FRONTEND_URL", "NEXT_PUBLIC_APP_URL", "NEXTAUTH_URL"]).replace(/\/+$/, "");
}

function accountSetupTemplate({
  fullName,
  setupUrl,
}: {
  fullName?: string | null;
  setupUrl: string;
}) {
  const greeting = fullName ? `Dear ${fullName},` : "Hello,";
  const paragraphs = [
    greeting,
    "Your IBPA account is ready. Use the secure link below to create your password and access your dashboard.",
    ctaButton("Create My Password", setupUrl),
    "For your security, this link can be used only once and expires in 3 days.",
  ];

  return {
    subject: "Set Up Your IBPA Account",
    html: wrapEmail("Welcome to your IBPA account", paragraphs),
    text: buildTextBody([
      greeting,
      "Your IBPA account is ready. Create your password using this secure link:",
      setupUrl,
      "For your security, this link can be used only once and expires in 3 days.",
    ]),
  };
}

function passwordResetTemplate({ resetUrl }: { resetUrl: string }) {
  const paragraphs = [
    "We received a request to reset the password for your IBPA account.",
    "Click the button below to set a new password. This link is valid for 1 hour.",
    ctaButton("Reset password", resetUrl),
    "If you did not request this, you can ignore this email. Your password will remain unchanged.",
  ];

  return {
    subject: "Reset Your IBPA Account Password",
    html: wrapEmail("Reset your password", paragraphs),
    text: buildTextBody([
      "We received a request to reset the password for your IBPA account.",
      "Use this link to set a new password. The link is valid for 1 hour:",
      resetUrl,
      "If you did not request this, you can ignore this email. Your password will remain unchanged.",
    ]),
  };
}

export async function sendAccountSetupEmail({
  to,
  fullName,
  token,
}: {
  to: string;
  fullName?: string | null;
  token: string;
}) {
  const setupUrl = `${getAppUrl()}/account/setup?token=${encodeURIComponent(token)}`;
  const email = accountSetupTemplate({ fullName, setupUrl });

  return sendEmail({
    type: "user",
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}

export async function sendAccountPasswordResetEmail({
  to,
  token,
}: {
  to: string;
  token: string;
}) {
  const resetUrl = `${getAppUrl()}/account/reset-password?token=${encodeURIComponent(token)}`;
  const email = passwordResetTemplate({ resetUrl });

  return sendEmail({
    type: "user",
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}

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
  const greeting = fullName ? `Hello ${fullName},` : "Hello,";
  const paragraphs = [
    greeting,
    "Your IBPA account is ready. Use the secure link below to set your password and open your dashboard.",
    ctaButton("Set account password", setupUrl),
    "This link is single-use and expires in 1 hour.",
  ];

  return {
    subject: "Set up your IBPA account",
    html: wrapEmail("Set up your IBPA account", paragraphs),
    text: buildTextBody([
      greeting,
      "Your IBPA account is ready. Set your password using this secure link:",
      setupUrl,
      "This link is single-use and expires in 1 hour.",
    ]),
  };
}

function passwordResetTemplate({ resetUrl }: { resetUrl: string }) {
  const paragraphs = [
    "You requested a password reset for your IBPA account.",
    "Click the button below to set a new password. This link is valid for 1 hour.",
    ctaButton("Reset password", resetUrl),
    "If you did not request this, you can ignore this email.",
  ];

  return {
    subject: "IBPA account password reset",
    html: wrapEmail("Password reset request", paragraphs),
    text: buildTextBody([
      "You requested a password reset for your IBPA account.",
      "Use this link to set a new password:",
      resetUrl,
      "If you did not request this, you can ignore this email.",
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

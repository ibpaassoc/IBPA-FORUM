import "server-only";

import { sendEmail } from "@/features/email/server/send-email";
import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";
import { readEnv } from "@/lib/env";
import type { ContactFormInput } from "@/features/contact/schemas/contact-form-schema";

const FALLBACK_RECIPIENT = "forum-support@ibpassociations.org";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getContactRecipient() {
  return (
    readEnv(["EMAIL_CONTACT", "CONTACT_EMAIL", "EMAIL_SUPPORT", "SUPPORT_EMAIL"]) ||
    FALLBACK_RECIPIENT
  );
}

/**
 * Sends a contact-form submission to the team inbox. The submitter's address is
 * set as reply-to so the team can answer directly. Returns whether the email was
 * delivered (the underlying sender degrades gracefully when Resend is not
 * configured, e.g. in local development).
 */
export async function submitContactMessage(input: ContactFormInput) {
  const subject = input.subject?.trim()
    ? input.subject.trim()
    : "New contact request";

  const html = wrapEmail("New contact message", [
    `<strong>Name:</strong> ${escapeHtml(input.name)}`,
    `<strong>Email:</strong> ${escapeHtml(input.email)}`,
    `<strong>Subject:</strong> ${escapeHtml(subject)}`,
    `<strong>Message:</strong><br/>${escapeHtml(input.message).replace(/\n/g, "<br/>")}`,
  ]);

  const text = buildTextBody([
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Subject: ${subject}`,
    `Message:\n${input.message}`,
  ]);

  const result = await sendEmail({
    type: "user",
    to: getContactRecipient(),
    replyTo: input.email,
    subject: `Contact form — ${subject}`,
    html,
    text,
  });

  return result;
}

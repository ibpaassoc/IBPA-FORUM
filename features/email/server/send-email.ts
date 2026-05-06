import "server-only";
import { Resend } from "resend";
import {
  EMAIL_REDIRECT_ALL_TO_TEST,
  resolveFrom,
  resolveTo,
  type EmailFromType,
} from "@/lib/email/config";

export type SendEmailInput = {
  type: EmailFromType;
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  delivered: boolean;
  recipient?: string;
  reason?: "email_test_missing" | "resend_missing";
};

function getNormalizedEmailPayload(input: SendEmailInput) {
  const from = resolveFrom(input.type);

  if (!from) {
    throw new Error(`Email sender for type "${input.type}" is not configured.`);
  }

  return {
    from,
    to: resolveTo(input.to),
    subject: input.subject,
    html: input.html,
    text: input.text,
  };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const payload = getNormalizedEmailPayload(input);

  if (EMAIL_REDIRECT_ALL_TO_TEST && !payload.to) {
    console.warn("EMAIL_TEST is not configured. Skipping redirected email send.");
    return {
      delivered: false,
      reason: "email_test_missing",
    };
  }

  if (!process.env.RESEND_API_KEY) {
    console.info("RESEND_API_KEY is not configured. Skipping email send.", {
      to: payload.to,
      subject: payload.subject,
    });
    return {
      delivered: false,
      recipient: payload.to,
      reason: "resend_missing",
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return { delivered: true };
}

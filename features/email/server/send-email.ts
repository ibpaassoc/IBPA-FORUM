import "server-only";
import { Resend } from "resend";
import {
  EMAIL_REDIRECT_ALL_TO_TEST,
  resolveFrom,
  resolveTo,
  type EmailFromType,
} from "@/lib/email/config";

export type EmailAttachment = {
  filename: string;
  content: Buffer;
  /** Used by the email client to resolve inline images referenced with cid:. */
  contentId?: string;
};

export type SendEmailInput = {
  type: EmailFromType;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

export type SendEmailResult = {
  delivered: boolean;
  recipient?: string;
  providerId?: string;
  reason?:
    | "email_sender_missing"
    | "email_recipient_missing"
    | "email_test_missing"
    | "resend_invalid_key"
    | "resend_missing"
    | "resend_error";
  error?: string;
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim();
}

function isByteString(value: string) {
  return [...value].every((character) => character.charCodeAt(0) <= 255);
}

function getNormalizedEmailPayload(input: SendEmailInput) {
  const from = resolveFrom(input.type);

  return {
    from,
    to: resolveTo(input.to),
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
    attachments: input.attachments,
  };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const payload = getNormalizedEmailPayload(input);

  if (!payload.from) {
    console.error("Email sender is not configured.", {
      type: input.type,
      to: payload.to,
      subject: payload.subject,
    });
    return {
      delivered: false,
      recipient: payload.to,
      reason: "email_sender_missing",
      error: `Email sender for type "${input.type}" is not configured.`,
    };
  }

  if (EMAIL_REDIRECT_ALL_TO_TEST && !payload.to) {
    console.warn("EMAIL_TEST is not configured. Skipping redirected email send.");
    return {
      delivered: false,
      reason: "email_test_missing",
    };
  }

  if (!payload.to) {
    console.error("Email recipient is not configured.", {
      type: input.type,
      from: payload.from,
      subject: payload.subject,
    });
    return {
      delivered: false,
      reason: "email_recipient_missing",
      error: "Email recipient is not configured.",
    };
  }

  const resendApiKey = getResendApiKey();

  if (!resendApiKey) {
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

  if (!isByteString(resendApiKey)) {
    console.error("RESEND_API_KEY contains non-ASCII characters.", {
      to: payload.to,
      subject: payload.subject,
    });
    return {
      delivered: false,
      recipient: payload.to,
      reason: "resend_invalid_key",
      error: "RESEND_API_KEY contains non-ASCII characters.",
    };
  }

  const resend = new Resend(resendApiKey);

  const result = await resend.emails.send({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
    attachments: payload.attachments,
  });

  if (result.error) {
    console.error("Resend failed to send email.", {
      type: input.type,
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      error: result.error,
    });

    return {
      delivered: false,
      recipient: payload.to,
      reason: "resend_error",
      error: result.error.message,
    };
  }

  return {
    delivered: true,
    recipient: payload.to,
    providerId: result.data.id,
  };
}
